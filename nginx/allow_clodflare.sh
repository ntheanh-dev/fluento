#!/bin/bash
set -e

echo "👉 Setup UFW for Cloudflare..."

# 2. Default policy
ufw default deny incoming
ufw default allow outgoing

# 3. Allow SSH (QUAN TRỌNG - tránh lock VPS)
ufw allow 22/tcp

# 4. Cloudflare IPv4 ranges
CF_IPS=(
"103.21.244.0/22"
"103.22.200.0/22"
"103.31.4.0/22"
"104.16.0.0/13"
"104.24.0.0/14"
"108.162.192.0/18"
"131.0.72.0/22"
"141.101.64.0/18"
"162.158.0.0/15"
"172.64.0.0/13"
"173.245.48.0/20"
"188.114.96.0/20"
"190.93.240.0/20"
"197.234.240.0/22"
"198.41.128.0/17"
)

# 5. Allow Cloudflare → port 80 & 443
for ip in "${CF_IPS[@]}"; do
  ufw allow from $ip to any port 80 proto tcp
  ufw allow from $ip to any port 443 proto tcp
done

# 6. Enable UFW
ufw --force enable

# 7. Show result
ufw status numbered

echo "✅ Done! Only Cloudflare can access 80/443"