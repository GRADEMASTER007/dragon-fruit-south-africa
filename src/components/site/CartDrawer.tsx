import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatZAR } from "@/lib/products";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5" /> Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <ShoppingBag className="h-10 w-10 opacity-40" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.sku} className="flex gap-3 rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-snug">{i.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {i.sku}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(i.sku, i.qty - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{i.qty}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(i.sku, i.qty + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="ml-auto h-7 w-7 text-destructive" onClick={() => remove(i.sku)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold">{formatZAR(i.price * i.qty)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-display text-xl font-semibold">{formatZAR(subtotal)}</span>
            </div>
            <Button
              className="w-full bg-gradient-fruit text-white shadow-glow hover:opacity-95"
              size="lg"
              onClick={() => {
                setOpen(false);
                navigate({ to: "/checkout" });
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
