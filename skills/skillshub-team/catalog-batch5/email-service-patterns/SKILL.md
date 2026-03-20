# Email Service Patterns

## Provider Abstraction
```typescript
interface EmailProvider {
    send(opts: { to: string; subject: string; html: string; from?: string }): Promise<void>;
}

class SendGridProvider implements EmailProvider {
    async send(opts) { await sgMail.send({ ...opts, from: opts.from || DEFAULT_FROM }); }
}

class ResendProvider implements EmailProvider {
    async send(opts) { await resend.emails.send(opts); }
}
```

## Template Engine
```typescript
const templates = {
    welcome: (name: string) => ({ subject: 'Welcome!', html: `<h1>Hi ${name}</h1>` }),
    resetPassword: (link: string) => ({ subject: 'Reset Password', html: `<a href="${link}">Reset</a>` }),
};
```

## Queue emails for reliability (Bull/BullMQ)
## Track: delivered, opened, clicked, bounced via webhooks
## Rate limiting, retry with exponential backoff