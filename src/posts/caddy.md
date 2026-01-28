---
title: "Local SSL Certificates with Caddy"
pubDate: "2026-01-01"
excerpt: "lol"
---

Here's how I get valid SSL certs for my homelab without exposing anything to the internet via Caddy, Cloudflare, Tailscale and NextDNS. If you're unfamiliar, [Caddy](https://caddyserver.com) is a web server and reverse proxy that automates SSL certificate handling, ships with sensible defaults and has a very intuitive '[Caddyfile](https://caddyserver.com/docs/caddyfile)' configuration file.

First, generate a Cloudflare API token via Profile -> [API Tokens](https://dash.cloudflare.com/profile/api-tokens) -> Create Token. Create a token with permissions for Zone.DNS. While you _can_ use a Global API Key, Cloudflare strongly discourage this.

```dockerfile
FROM caddy:builder AS builder
RUN caddy-builder \
    github.com/caddy-dns/cloudflare
FROM caddy:latest
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

This Dockerfile builds caddy with the [Cloudflare DNS plugin](https://github.com/caddy-dns/cloudflare). One side effect of plaintexthis is container update methods such as `watchtower` won't update this automatically because it's built locally rather than pulling from a registry, so updates require rebuilding the image. Though as it isn't actually open to the internet I'm less concerned about updates.

```yml
services:
  caddy:
    build:
      context: .
      dockerfile: Dockerfile-caddy
    container_name: caddy
    networks:
      - proxy
    environment:
      - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
    volumes:
      - ${DOCKER_DATA_DIR}/caddy/Caddyfile:/etc/caddy/Caddyfile
      - ${DOCKER_DATA_DIR}/caddy/data:/data
      - ${DOCKER_DATA_DIR}/caddy/config:/config
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped

networks:
  proxy:
    driver: bridge
    name: proxy
```

With this setup, as all web traffic is going to go through the reverse proxy I don't have to open web interface ports in other containers as long as they're on the 'proxy' network. This is especially important if you're using Caddy as a reverse proxy open to the internet and don't have some kind of edge firewall as Docker will punch a hole through the firewall whenever you declare a port.

I have a `*.local.example.com` subdomain (important to note this is not the .local TLD but a subdomain of a domain I own) pointing to the LAN IP address of the server and Caddyfile entries for each of the services I want to use, for example:

```plaintext
*.local.example.com {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  @syncthing host syncthing.local.example.com
  reverse_proxy @syncthing syncthing:8384
}
```

For services that insist on using a self-signed cert we can use `tls_insecure_skip_verify`. This disables certificate validation entirely, so only use it for trusted devices you control. I use this to securely access my [OpenWRT](https://openwrt.org) router on the LAN:

```plaintext
  @openwrt host openwrt.local.example.com
  reverse_proxy @openwrt https://192.168.1.1:443 {
    transport http {
      tls_insecure_skip_verify
    }
  }
```

I use [Tailscale](https://tailscale.com) to access these services when I'm not on LAN, which is most of the time these days. I initially considered pointing my `*.local` DNS to the Tailscale IP of the server or even a CNAME for its Tailscale 'Magic DNS' name but this would force LAN devices to hairpin through Tailscale and exclude devices that can't run it. Enter [NextDNS](https://nextdns.io/), a DNS service with ad filtering, DoH and a bunch of other cool features adjacent to something like PiHole: as passionate as I am about self hosting I draw the line at DNS so they're a great fit and they provide a [client](https://github.com/nextdns/nextdns/wiki/OpenWRT) for OpenWRT routers[^1].

I run two profiles, one for LAN and one for Tailscale. Both require disabling of "DNS Rebinding Protection", which is on by default and blocks DNS responses containing private IP addresses. Then we visit Settings > Rewrites in the Tailscale profile to point `*.local.example.com` to the Tailscale IP of the server.

I've been running this setup for a year or so without incident and while I'm strongly considering migrating from a stack of Docker containers to Proxmox (more on this in another post) I'll definitely be sticking with Caddy.

[^1]: I recommend blocking 8.8.8.8/4.4.8.8 to stop badly behaved devices and apps that hardcode Google DNS.
