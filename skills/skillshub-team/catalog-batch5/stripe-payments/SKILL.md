# Stripe Payments

## Setup
```bash
npm install stripe
```

## Checkout Session
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: 'price_xxx', quantity: 1 }],
    success_url: 'https://app.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://app.com/cancel',
});
// Redirect to session.url
```

## Subscriptions
```typescript
const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: 'price_monthly', quantity: 1 }],
    success_url: '...',
});
```

## Webhooks
```typescript
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    switch (event.type) {
        case 'checkout.session.completed': handlePayment(event.data.object); break;
        case 'customer.subscription.deleted': handleCancellation(event.data.object); break;
    }
    res.json({ received: true });
});
```

## Customer Portal: stripe.billingPortal.sessions.create({ customer })
