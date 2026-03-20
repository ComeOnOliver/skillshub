# Stripe Subscriptions

## Create Subscription via Checkout
```typescript
const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: 'price_monthly_pro', quantity: 1 }],
    success_url: 'https://app.com/success',
    cancel_url: 'https://app.com/pricing',
    customer: customerId,
});
```

## Manage Subscription
```typescript
await stripe.subscriptions.update(subId, { items: [{ price: 'price_annual_pro' }] });
await stripe.subscriptions.cancel(subId);
```

## Billing Portal
```typescript
const portal = await stripe.billingPortal.sessions.create({
    customer: customerId, return_url: 'https://app.com/settings',
});
// Redirect to portal.url
```

## Webhook Events: customer.subscription.created/updated/deleted, invoice.paid/payment_failed