---
title: "mednafen-chd"
pubDate: "2026-04-16"
excerpt: "building a fork of mednafen with chd support"
---

I've been working on a fork of the [mednafen] multi-system emulator that supports mame's [CHD] disc image format. The CHD implementation itself comes from [Joe Mattiello's][joematt] work on the Provenance emulator for iOS/tvOS. I ported this to upstream mednafen with some fixes for Redbook audio & Windows compatibility.

Obligatory screenshot of Final Fantasy VII loaded from a playlist of CHD files:

![mednafen loading a chd playlist](/img/mednafen_chd_screenshot.png)

[Source on Github]. Requires [libchdr].


[mednafen]: https://mednafen.github.io/
[joematt]: https://github.com/joematt
[libchdr]: https://github.com/rtissera/libchdr
[CHD]: https://docs.mamedev.org/tools/chdman.html
[Source on Github]: https://github.com/stetime/mednafen-chd
