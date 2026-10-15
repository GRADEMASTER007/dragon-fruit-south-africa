# Inventory allocation semantics

## Reservation

Checkout creates one durable `inventory_allocations` row per order SKU in the same transaction as the order, items, and payment. Products are locked in SKU order. For each SKU, availability is `products.stock` minus allocations in the same environment that still reserve capacity:

- **live:** `reserved` allocations;
- **test:** `reserved` and `consumed` allocations.

This makes a sandbox checkout a real reservation test without decrementing the production `products.stock` value. The `(order_id, sku, environment)` unique key ensures an idempotent checkout request cannot create a second allocation. An existing unreserved pending checkout is not redirected again; it requires merchant reconciliation.

## Verified captures

A verified capture only fulfils an order when every order line has one matching `reserved` allocation for the payment environment and quantity.

- **Test:** matching allocations become `consumed`; `products.stock` is never changed. Consumed sandbox allocations continue to count against sandbox availability.
- **Live:** matching allocations are consumed and `products.stock` is decremented only in the same transaction after locked stock is sufficient. Live checkout activation remains disabled; this only protects any already-existing, correctly correlated live payment rows handled by the shared event path.

Duplicate delivery cannot consume an allocation or decrement stock again: payment and webhook-event locks make later deliveries no-ops.

## Exception handling

A validly verified payment with missing, mismatched, non-reserved, or (for live) insufficient stock allocation is still recorded as captured for accounting, but its order becomes `paid_stock_review`. It is **not fulfilled** and its allocation is not consumed or released, so a merchant can investigate and reconcile it deliberately.

Do not release allocations from a browser return/cancel, an expiry clock, or a failed signed event. Yoco has no documented checkout-close or checkout-retrieve API that establishes final non-payment, and a late verified capture may still arrive. Failed payments therefore keep their pending allocation until explicit merchant reconciliation; this change does not create automatic refunds.
