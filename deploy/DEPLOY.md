# Deploying UPI Down to the Hostinger KVM 2

The site is static files served by the existing Nginx. The API, Postgres and Redis run in Docker with hard CPU and memory caps. Nothing touches NMhelper's Nginx config or ports.

Ports used (all bound to 127.0.0.1): API 3020, Postgres 5442, Redis 6390. Check they are free first:

```sh
ss -tlnp | grep -E ':(3020|5442|6390)\b'   # should print nothing
```

## 1. DNS and TLS (Cloudflare)

1. Add an `A` record `upidown` → VPS IP, proxied (orange cloud).
2. SSL/TLS mode: Full (strict). Create an Origin Certificate for `upidown.nishal.dev` and save it on the VPS as `/etc/ssl/cloudflare/upidown.pem` and `.key` (chmod 600).
3. Cache rule: `upidown.nishal.dev/api/status` → eligible for cache, edge TTL 5s. Bypass cache for `/api/status/stream` and `/api/report`.

## 2. Code and API

```sh
sudo mkdir -p /opt/upi-down && sudo chown $USER /opt/upi-down
git clone <repo> /opt/upi-down && cd /opt/upi-down
cp deploy/.env.example deploy/.env
# fill POSTGRES_PASSWORD and HASH_SECRET:  openssl rand -hex 32
# paste the Turnstile secret into TURNSTILE_SECRET (Cloudflare > Turnstile > widget > Settings)
# the widget's hostname list must include upidown.nishal.dev; subdomains such as app. are covered
docker compose -f deploy/docker-compose.yml up -d --build
curl -s 127.0.0.1:3020/api/healthz
```

## 3. Website

Build on your PC (or the VPS if it has Node 22 + pnpm) and upload `apps/web/out`:

```sh
pnpm install
NEXT_PUBLIC_API_URL=https://upidown.nishal.dev NEXT_PUBLIC_SITE_URL=https://upidown.nishal.dev pnpm --filter web build
rsync -az --delete apps/web/out/ vps:/opt/upi-down/web/out/
```

## 4. Nginx

```sh
sudo cp deploy/cloudflare-realip.conf /etc/nginx/snippets/
sudo cp deploy/nginx-upidown.nishal.dev.conf /etc/nginx/sites-available/upidown.nishal.dev
sudo ln -s /etc/nginx/sites-available/upidown.nishal.dev /etc/nginx/sites-enabled/
sudo mkdir -p /var/cache/nginx/upidown
sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` must pass before reload, otherwise every site on the box is at risk.

## 5. Load guard for NMhelper

```sh
chmod +x deploy/degrade.sh
( crontab -l; echo '* * * * * /opt/upi-down/deploy/degrade.sh' ) | crontab -
```

When load stays above 1.5, live streaming turns off and clients poll every 60s. Worst case UPI Down uses 1.25 CPU and about 1.1 GB RAM, at low CPU priority.

Watch it: `docker stats upidown-api-1 upidown-postgres-1 upidown-redis-1`.

## Android release

```sh
keytool -genkeypair -v -keystore upidown-upload.jks -alias upload -keyalg RSA -keysize 4096 -validity 10000
```

Create `apps/web/android/keystore.properties` (gitignored):

```
storeFile=../../upidown-upload.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

Then `pnpm android` syncs, and `cd apps/web/android && ./gradlew bundleRelease` builds `app/build/outputs/bundle/release/app-release.aab` with R8 on. Enrol in Play App Signing. New personal developer accounts must run a closed test with 12 testers for 14 days before production.

Data safety form: no personal data collected or shared. Reports store only bank, app, failure kind and time (deleted after 30 days). A random device ID and the IP are hashed with a daily salt and kept in Redis as rate-limit keys that expire within an hour.
