import { createHash, randomBytes, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { database, rows } from "./database";
import { json } from "./http";

export const sessionCookie = "webdev_app_session";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const cookie = (request: Request, name: string) =>
  request.headers
    .get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
const signingKey = () => {
  if (!process.env.MANUS_JWT_SECRET || !process.env.MANUS_PROJECT_ID)
    throw new Error("Manus login is not configured.");
  return new TextEncoder().encode(process.env.MANUS_JWT_SECRET);
};
export type User = {
  id: string;
  openId: string;
  name: string;
  email: string;
  role: "admin" | "customer";
};

export async function sessionUser(request: Request): Promise<User | null> {
  const token = cookie(request, sessionCookie);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"] });
    const identity = z
      .object({
        openId: z.string().min(1).max(191),
        appId: z.literal(process.env.MANUS_PROJECT_ID),
        exp: z.number(),
        name: z.string().max(200).optional(),
        email: z.string().max(320).optional(),
      })
      .parse(payload);
    if (identity.exp <= Math.floor(Date.now() / 1000)) return null;
    const allowed = (process.env.DFSA_ADMIN_OPEN_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const role = allowed.includes(identity.openId) ? "admin" : "customer";
    const id = randomUUID();
    await database().execute(
      `INSERT INTO users (id, open_id, name, email, role) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = IF(VALUES(name) = '', name, VALUES(name)), email = IF(VALUES(email) = '', email, VALUES(email)), role = VALUES(role)`,
      [id, identity.openId, identity.name || "", identity.email || "", role],
    );
    const record = (
      await rows<RowDataPacket>(
        "SELECT id, open_id, name, email, role FROM users WHERE open_id = ?",
        [identity.openId],
      )
    )[0];
    return { id: record.id, openId: record.open_id, name: record.name, email: record.email, role };
  } catch {
    return null;
  }
}

export async function requireAdmin(request: Request) {
  const user = await sessionUser(request);
  if (!user) throw new Error("Authentication required.");
  if (user.role !== "admin") throw new Error("Administrator access required.");
  return user;
}

async function oauthRpc(method: string, body: unknown) {
  const base = process.env.MANUS_OAUTH_API_URL;
  if (!base) throw new Error("Manus login is not configured.");
  const response = await fetch(
    `${base.replace(/\/$/, "")}/webdev.v1.WebDevAuthPublicService/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "connect-protocol-version": "1" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    },
  );
  const value = await response.json();
  if (!response.ok || value.error)
    throw new Error("Manus login could not be completed. Please try again.");
  return value;
}

export async function beginLogin(request: Request, input: unknown) {
  const { origin } = z
    .object({ origin: z.string().url().max(300) })
    .strict()
    .parse(input);
  const url = new URL(origin);
  if (
    url.origin !== origin ||
    url.protocol !== "https:" ||
    request.headers.get("x-dfsa-origin") !== origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return json({ error: "Login must be started from this site's HTTPS page." }, 403);
  const portal = process.env.MANUS_OAUTH_PORTAL_URL;
  const appId = process.env.MANUS_PROJECT_ID;
  if (!portal || !appId) return json({ error: "Manus login is not configured." }, 503);
  const nonce = randomBytes(32).toString("hex");
  const redirectUri = `${origin}/api/auth/callback`;
  await database().execute(
    "INSERT INTO oauth_nonces (nonce_hash, redirect_uri, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
    [hash(nonce), redirectUri],
  );
  const state = Buffer.from(JSON.stringify({ redirectUri, nonce })).toString("base64");
  const binding = await new SignJWT({ nonce, redirectUri, appId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(signingKey());
  const target = new URL(`${portal.replace(/\/$/, "")}/app-auth`);
  target.search = new URLSearchParams({
    appId,
    redirectUri,
    state,
    responseType: "code",
  }).toString();
  const response = json({ url: target.toString() });
  response.headers.set(
    "Set-Cookie",
    `dfsa_oauth_state=${binding}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=600`,
  );
  return response;
}

export async function finishLogin(request: Request) {
  const params = new URL(request.url).searchParams;
  try {
    const state = z
      .object({ redirectUri: z.string().url().max(500), nonce: z.string().regex(/^[a-f0-9]{64}$/) })
      .parse(JSON.parse(Buffer.from(params.get("state") || "", "base64").toString("utf8")));
    const token = cookie(request, "dfsa_oauth_state");
    if (!token) throw new Error("OAuth state cookie is missing.");
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"] });
    if (
      payload.nonce !== state.nonce ||
      payload.redirectUri !== state.redirectUri ||
      payload.appId !== process.env.MANUS_PROJECT_ID
    )
      throw new Error("OAuth state mismatch.");
    const [consumed] = await database().execute<ResultSetHeader>(
      "UPDATE oauth_nonces SET consumed_at = NOW() WHERE nonce_hash = ? AND redirect_uri = ? AND expires_at > NOW() AND consumed_at IS NULL",
      [hash(state.nonce), state.redirectUri],
    );
    if (consumed.affectedRows !== 1) throw new Error("OAuth state expired or already used.");
    const code = params.get("code");
    if (!code || code.length > 5000) throw new Error("OAuth code missing.");
    const exchanged = await oauthRpc("ExchangeToken", {
      clientId: process.env.MANUS_PROJECT_ID,
      grantType: "authorization_code",
      code,
      redirectUri: state.redirectUri,
    });
    if (typeof exchanged.accessToken !== "string") throw new Error("OAuth exchange token missing.");
    const identity = z
      .object({
        openId: z.string().min(1).max(191),
        name: z.string().max(200).optional(),
        email: z.string().max(320).optional(),
      })
      .parse(await oauthRpc("GetUserInfo", { accessToken: exchanged.accessToken }));
    const session = await new SignJWT({ ...identity, appId: process.env.MANUS_PROJECT_ID })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(signingKey());
    const response = new Response(null, {
      status: 303,
      headers: { Location: "/account", "Cache-Control": "no-store" },
    });
    response.headers.append(
      "Set-Cookie",
      `${sessionCookie}=${session}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000`,
    );
    response.headers.append(
      "Set-Cookie",
      "dfsa_oauth_state=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0",
    );
    return response;
  } catch {
    const response = new Response(null, {
      status: 303,
      headers: { Location: "/account?login=failed", "Cache-Control": "no-store" },
    });
    response.headers.set(
      "Set-Cookie",
      "dfsa_oauth_state=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0",
    );
    return response;
  }
}

export function logout() {
  const response = json({ signedOut: true });
  response.headers.set(
    "Set-Cookie",
    `${sessionCookie}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`,
  );
  return response;
}
