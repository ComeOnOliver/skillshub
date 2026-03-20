# SendGrid Email

## Setup
```bash
npm install @sendgrid/mail
```

## Send Email
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
    to: 'user@example.com',
    from: 'noreply@myapp.com',
    subject: 'Welcome!',
    html: '<h1>Welcome to MyApp</h1><p>Thanks for signing up.</p>',
});
```

## Dynamic Templates
```typescript
await sgMail.send({
    to: 'user@example.com', from: 'noreply@myapp.com',
    templateId: 'd-xxxx',
    dynamicTemplateData: { name: 'Alice', resetLink: 'https://...' },
});
```

## Bulk Send
```typescript
await sgMail.sendMultiple({
    to: ['a@b.com', 'c@d.com'], from: 'noreply@app.com',
    subject: 'Newsletter', html: '<p>Monthly update</p>',
});
```

## Webhooks for delivery tracking: delivered, opened, clicked, bounced