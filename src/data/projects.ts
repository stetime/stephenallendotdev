export type Project = {
  name: string;
  description: string;
  href: string;
};

export const projects: Project[] = [
  {
    name: "feedin",
    description: "an rss/atom feed reader written in typescript (golang rewrite WIP...)",
    href: "https://github.com/stetime/feedin"
  }, 
  {
    name: "stavros",
    description: "a discord bot for rss/atom feed subscriptions and integration with x/reddit",
    href: "https://github.com/stetime/stavros"
  },
  {
    name: "last.fm collage generator",
    description: "generates collages of album art from a last.fm album history, inspired by tapmusic.net",
    href: "https://github.com/stetime/lastfmcollagegenerator"
  },
  {
    name: "mednafen-chd",
    description: "a fork of the mednafen multi-system emulator with support for chd disc images",
    href: "https://github.com/stetime/mednafen-chd"
  },
];
