---
title: "docker gpu passthrough woes"
pubDate: "2026-09-09"
excerpt: ""
---
Recently noticed that my Nvidia gpu wasn't being used by Plex hardware transcoding despite having the driver correctly installed and passed through as normal. After attempting to debug this for a while and throwing an llm at it to no joy, I found [a fix ](https://forums.plex.tv/t/hardware-transcoding-silently-falls-back-to-software-nvenc-nvdec-plex-transcoder-cant-find-libc/941035) buried on the plex.tv forum with ~20 views - adding this env variable to the compose file:

```yaml
  environment:
    - LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/nvidia/current
```

Surprised how difficult this was to debug and how obscure the solution was considering I'm running Plex in one of the most normie configurations possible: debian stable, docker compose, nvidia gpu. Feel compelled to share this one.