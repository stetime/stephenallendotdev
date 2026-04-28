---
title: "Home Labbin'"
pubDate: "2026-01-01"
excerpt: "Way before this stuff was codified as 'home labbing' I always had some kind of repurposed old gaming PC shoved in a cupboard running a flavour of Linux for _mission critical infra_ like streaming films off a samba share and running a terminal IRC client."
---

Way before this stuff was codified as "home labbing" I always had some kind of repurposed old gaming PC shoved in a cupboard running a flavour of Linux for _mission critical infra_ like streaming films off a samba share and running a terminal IRC client. Things haven't changed too much: I currently have the old i5 6500K & GTX1060 I played _Witcher 3_ on stashed under the stairs with a Debian install, only these days the software stack is much more impressive:

## Docker

I'm running a lot of the usual suspects - [Plex], [Immich], [syncthing] etc. along with instances of postgres and redis for my own dev projects all via docker containers. Every so often docker networking makes me consider migrating a lot of this setup to [proxmox] and lxc but that's probably bikeshedding.

## ZFS

Storage is handled by a couple of 16tb spinning rust drives in a mirrored ZFS array. While the drives themselves have perversely appreciated in value since I bought them I couldn't be happier with ZFS. Configuration is stored on the disks themselves., so if you migrate to a new machine or reinstall the OS you just run `zfs import` and... that's it. RAM requirements are high - ZFS will use whatever it can for cache, but luckily I bought a 64GB kit before prices became absurd. Debian itself is booting off NVME, of course.

## Tailscale

To reach all of these services remotely, I run [Tailscale] rather than vanilla Wireguard. _It Just Works._ Fantastic service, I'm wary of a future heel turn but the open source implementation [Headscale] makes me feel better about the possibility. The Apple TV client is awesome.

## Caddy

To prevent Chrome & Safari complaining about SSL I've configured [Caddy] as a reverse proxy with a wildcard cert for a domain I have pointing to the _local_ IP of the server. This is where complexity creeps in - this setup requires a custom build of Caddy with the Cloudflare plugin (swap in an alternative if your DNS is with someone else, obviously):

```Dockerfile
FROM caddy:builder AS builder
RUN caddy-builder \
    github.com/caddy-dns/cloudflare
FROM caddy:latest
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

One thing to note is container updating methods such as `watchtower` won't update this automatically because it's built locally, rather than pulling from a registry. As this isn't open to the internet I'm not that arsed, but something to keep in mind.

(Update: I've started [running Caddy as a systemd service](https://caddyserver.com/docs/build#package-support-files-for-custom-builds-for-debianubunturaspbian) as updates are actually easier & for debugging you can see which clients are hitting which services rather than all traffic looking like it's coming from the Docker NAT)

I run the Caddy container via docker-compose with ports 80/443 open on a 'proxy' network that other containers with a web interface can join:

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

A typical Caddyfile entry looks like this:

```
*.example.com {
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
  @syncthing host syncthing.example.com
  reverse_proxy @syncthing syncthing:8384
}
```

## NextDNS

While I'm passionate about self-hosting I draw the line at DNS, It's great until it suddenly doesn't work. [NextDNS] is rock solid, has a client for almost everything including my OpenWRT router and is dirt cheap. For this setup I disable DNS rebind protection and have two separate profiles - one for when I'm on LAN with the server and the DNS entry pointing to its local IP is valid, and another for when I'm remote via Tailscale that rewrites to the Tailscale IP.

[Plex]: https://plex.tv
[syncthing]: https://syncthing.net/
[Immich]: https://immich.app/
[Caddy]: https://caddyserver.com/
[NextDNS]: https://nextdns.io/
[Tailscale]: https://tailscale.com/
[proxmox]: https://proxmox.com/en/
[Headscale]: https://headscale.net/stable/
