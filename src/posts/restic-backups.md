---
title: "Home backups with Restic"
pubDate: "2026-07-08"
excerpt: "Enter restic, a cross-platform tool that makes encrypted deduplicated backups."
---

While migrating my Thinkpad from Arch to Fedora this past week, it hit me that despite having access to a server with a zfs array I'd really procrastinated on any kind of "backup strategy" for my workstations. Enter [`restic`](https://restic.net/), a cross-platform tool that makes encrypted deduplicated backups. It can be paired with `rclone` for backing up to pretty much any cloud storage provider but for now I'll stick with plain sftp over [Tailscale](https://tailscale.com/) which `restic` will manage just fine.

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

I'm using Tailscale SSH for the transport rather than exposing SSH to the internet. If using regular SSH/SFTP, configure key-based authentication instead.

Install Restic via your package manager:

```bash
sudo dnf install restic
```

Use the restic client to initialise a new repository on the server:

```bash
restic init \
  -r sftp:restic@[server ip/host]:/backups/fedora-thinkpad 
  # if using ssh key login add: -o sftp.args="-i /path/to/key"
```

This will prompt for a secure password. Remember to stick this in your password manager as this is required for a restore. 

I use the following script to automate backups: 

```bash
#!/bin/bash
set -euo pipefail
NAS_HOST="nas host/ip"
NAS_PORT=22
HOME=/home/user
export RESTIC_REPOSITORY="sftp:restic@${NAS_HOST}:/backups/fedora-thinkpad"
export RESTIC_PASSWORD_FILE="/etc/restic/password"
LOG_FILE="/var/log/restic-backup.log"
NTFY_URL="https://your-ntfy-instance"
EXCLUDES="$HOME/.config/restic/linux-excludes.txt"
TOPIC="backups"

notify() {
if ! curl -sf -m 15 --retry 3 --retry-delay 5 \
-H "Title: Restic Backup" \
-H "Priority: ${2:-default}" \
-d "$1" \
"$NTFY_URL/$TOPIC" >/dev/null; then
echo "NOTIFY FAILED: could not reach $NTFY_URL/$TOPIC" | tee -a "$LOG_FILE" >&2
fi
}

on_success() {
notify "✅ Backup completed successfully on $(hostname) at $(date)"
}

on_failure() {
notify "❌ Backup FAILED on $(hostname) at $(date)" "high"
}

echo "Restic backup started: $(date)" >> "$LOG_FILE"
backup_ok=true
echo "Waiting for $NAS_HOST:$NAS_PORT ..." >> "$LOG_FILE"

for i in $(seq 1 12); do
if timeout 5 bash -c "</dev/tcp/$NAS_HOST/$NAS_PORT" 2>/dev/null; then
break
fi
sleep 10
done
if ! timeout 5 bash -c "</dev/tcp/$NAS_HOST/$NAS_PORT" 2>/dev/null; then
echo "FATAL: $NAS_HOST:$NAS_PORT unreachable after wait" | tee -a "$LOG_FILE"
on_failure
exit 1
fi

restic backup \
# example directories:
"$HOME/Documents" \
"$HOME/code" \
"$HOME/.config" \
"$HOME/Pictures" \
--exclude-file "$EXCLUDES" \
--one-file-system \
>> "$LOG_FILE" 2>&1 || backup_ok=false

  
restic forget \
--keep-daily 7 \
--keep-weekly 4 \
--keep-monthly 3 \
--prune \
>> "$LOG_FILE" 2>&1 || true
echo "Restic backup finished: $(date)" >> "$LOG_FILE"

if $backup_ok; then
on_success
else
on_failure
exit 1
fi
```

Store your password:

```shell
sudo mkdir -p /etc/restic
echo "password" | sudo tee /etc/restic/password
sudo chmod 600 /etc/restic/password
sudo chmod 700 /usr/local/bin/restic-backup.sh
```

This script might be a bit verbose for your needs: I'm using an excludes file which you format like a .gitignore, but you could just append individual `--exclude=/path` arguments to `restic`.
I'm also using [ntfy](https://ntfy.sh/) to send push notifications to my phone on success/fail (though definitely going to amend this to failure-only after initial testing). 

To automate this with systemd:

```bash
sudo vim /etc/systemd/system/restic-backup.service
```

```bash
[Unit]
Description=Restic backup
Wants=network-online.target
After=network-online.target tailscaled.service
[Service]
Type=oneshot
ExecStart=/usr/local/bin/restic-backup.sh
```

```bash
sudo vim /etc/systemd/system/restic-backup.timer
```

```bash
[Unit]
Description=Run Restic backup nightly
[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
[Install]
WantedBy=timers.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now restic-backup.timer
```

As the client in my case is a laptop, this is unlikely to ever fire at 2AM but `Persistent=true` makes sure it'll try on boot when it misses that call, which is why I take extra care to check that the network is and that the server is reachable. You can also remove the explicit `HOME` variable in the script, add a `User` entry to the systemd service and change the permissions of the password file accordingly if you don't want to run the service as root. 

Before you trust it, test a restore:

```bash
mkdir -p /tmp/restic-test
restic restore latest --target /tmp/restic-test
```

I'm going to experiment with zfs snapshots in addition to this but I'm feeling slightly less irresponsible than before.