Place Cloudflare Origin Certificate files in this directory on the VPS:

- `origin.crt`
- `origin.key`

These files are mounted into the nginx container at `/etc/nginx/certs`.

Recommended permissions on VPS:

- `chmod 600 origin.key`
- `chmod 644 origin.crt`
