# Apache Performance

## Compression
```apache
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
```

## Caching Headers
```apache
<FilesMatch "\.(jpg|png|css|js|woff2)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>
```

## MPM Event Tuning
```apache
StartServers 3
MinSpareThreads 75
MaxSpareThreads 250
MaxRequestWorkers 400
```

## Security
```apache
ServerTokens Prod
ServerSignature Off
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Options -Indexes
```