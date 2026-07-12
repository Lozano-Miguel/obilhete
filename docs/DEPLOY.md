# Deployment notes

O Bilhete is self-hosted behind a reverse proxy. This document covers the one
non-obvious deployment requirement: **request timeouts**.

## Why timeouts matter

`POST /api/profile` runs the whole pipeline synchronously (scrape → TMDB enrich →
Groq). For large Letterboxd profiles this can take **3+ minutes**. A reverse proxy's
default read timeout (typically 60s) will kill the request with a 502/504 long before
the pipeline finishes.

Raise the upstream/read timeout to at least **600s** on whatever proxy sits in front of
the app.

## Nginx / Nginx Proxy Manager

For the `/api/profile` location (or the whole host), set:

```nginx
proxy_read_timeout 600s;
proxy_send_timeout 600s;
```

In **Nginx Proxy Manager**, put these in the proxy host's
_Advanced → Custom Nginx Configuration_ box:

```nginx
location /api/profile {
    proxy_pass http://<app-upstream>;
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
}
```

## Caddy

```
handle /api/profile {
    reverse_proxy <app-upstream> {
        transport http {
            read_timeout 600s
            write_timeout 600s
        }
    }
}
```

## Cloudflare Tunnel (if the app is fronted by Cloudflare)

Cloudflare's edge enforces its own **~100s** limit on a single HTTP request (error 524)
that the origin timeout above cannot override. A cold, large-profile request can exceed
this. Options if that becomes a problem:

- Keep profiles warm via the 24h cache so only the first fetch is slow.
- Prefer POSTing `/api/profile` from a context that tolerates the initial long request,
  and rely on the cache for subsequent loads.

At this project's scale (~5 uses/month) the occasional slow cold request is acceptable
and no queue/async layer is warranted.
