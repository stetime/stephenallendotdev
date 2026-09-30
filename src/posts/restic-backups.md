---
title: "home backups with restic"
pubDate: "2026-07-08"
excerpt: "getting into encrypted deduplicated backups with restic"
---

While migrating my Thinkpad to Fedora 44 this past week, it hit me that despite having access to a server with a zfs array I'd really procrastinated on any kind of "backup strategy" for my workstations. Enter [restic](https://restic.net/), a cross-platform tool that makes encrypted deduplicated backups. It can be paired with [rclone](https://rclone.org/) for backing up to pretty much any cloud storage provider but for now I'll stick with plain sftp over [Tailscale](https://tailscale.com/) which restic will manage just fine.

Create a backups zfs dataset:

```bash
zfs create -o mountpoint=/backups tank/backups
zfs set compression=lz4 tank/backups
zfs set atime=off tank/backups
```

Create a backups user and give them ownership of /backups:

```bash
sudo useradd -s /usr/sbin/nologin restic
sudo chown restic:restic /backups
sudo chmod 700 /backups
```

Install restic via your package manager:

```bash
sudo dnf install restic
```

Use the restic client to initialise a new repository on the server:

```bash
restic init \
  -r sftp:restic@[server ip/host]:/backups/fedora-thinkpad 
  # if using ssh key login add: -o sftp.args="-i /path/to/key"
```

This will prompt for a secure password. Remember to stick this in your password manager as this is required for a restore. I'm using Tailscale SSH for the transport rather than exposing SSH to the internet or using regular wireguard etc. If using regular SSH/SFTP, configure key-based authentication instead.

Then schedule backups via systemd, for example:

`/etc/systemd/system/restic-backup.service`

```ini
[Unit]
Description=restic backup to nas
Wants=network-online.target
After=network-online.target tailscaled.service
Requires=tailscaled.service

[Service]
Type=oneshot
EnvironmentFile=/etc/restic/backup.env
User=user
ExecStart=/usr/bin/restic backup \
  /home/user \
  /example/path \
  --exclude-file=/etc/restic/excludes.txt \
  --repo="${RESTIC_REPOSITORY}"
```
`excludes.txt` is basically the same as a `.gitignore`, so don't backup caches and node_modules etc. 

I've been backing up my desktop, thinkpad and immich library with this and feel marginally more responsible than before. 