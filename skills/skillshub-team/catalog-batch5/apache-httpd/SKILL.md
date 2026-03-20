# Apache httpd

## Virtual Hosts
```apache
<VirtualHost *:80>
    ServerName myapp.com
    DocumentRoot /var/www/myapp/public
    <Directory /var/www/myapp/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## SSL: sudo certbot --apache -d myapp.com
## Reverse Proxy
```apache
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
```

## .htaccess (SPA fallback)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [L]
```

## Modules: sudo a2enmod rewrite ssl proxy headers expires deflate
## Security: ServerTokens Prod, X-Frame-Options, CSP headers