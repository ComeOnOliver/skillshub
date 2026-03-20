# SAML SSO

## Flow: SP → AuthnRequest → IdP → SAML Response → SP ACS URL

## Node.js (saml2-js)
```typescript
const sp = new saml2.ServiceProvider({
    entity_id: 'https://app.com/saml/metadata',
    assert_endpoint: 'https://app.com/saml/acs',
    private_key: fs.readFileSync('sp-key.pem', 'utf-8'),
    certificate: fs.readFileSync('sp-cert.pem', 'utf-8'),
});

app.get('/saml/login', (req, res) => {
    sp.create_login_request_url(idp, {}, (err, url) => res.redirect(url));
});

app.post('/saml/acs', (req, res) => {
    sp.post_assert(idp, { request_body: req.body }, (err, resp) => {
        req.session.user = { email: resp.user.name_id };
        res.redirect('/dashboard');
    });
});
```

## Generate Certs: openssl req -x509 -newkey rsa:2048 -keyout sp-key.pem -out sp-cert.pem -days 3650 -nodes