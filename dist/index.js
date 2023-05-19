import pkg, { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import express from 'express';
import { exit } from 'process';

const { AppBskyFeedPost } = pkg;
const defaultLang = `en-US`;
async function parseSkeet(url, agent, locale = defaultLang) {
  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname;
  const parts = path.split("/");
  const actor = parts[2];
  const id = parts[4];
  let parsedLocale = locale.includes(",") ? locale.split(",")[0] : locale;
  if (parsedLocale.includes("*")) {
    parsedLocale = defaultLang;
  }
  console.debug(`Attempting to build OG tags for ${parsedUrl}`);
  const profile = await agent.app.bsky.actor.getProfile({ actor });
  const did = profile.data.did;
  const post = await agent.app.bsky.feed.getPostThread({
    uri: `at://${did}/app.bsky.feed.post/${id}`,
    depth: 0
  });
  if (AppBskyFeedPost.validateEntity(post.data)) {
    const postView = post.data.thread.post;
    let text = "";
    if ("text" in postView.record) {
      text = postView.record.text;
    }
    let thumb = "";
    if (postView.embed?.media) {
      const media = postView.embed?.media;
      if ("thumb" in media.images[0]) {
        thumb = media.images[0].thumb;
      }
    }
    let images = [];
    if (postView.embed?.images) {
      images = postView.embed?.images;
      if (images[0] != void 0) {
        thumb = images[0].thumb;
      }
    }
    let date;
    let time;
    if ("createdAt" in postView.record) {
      console.debug(`Post date: ${postView.record.createdAt}`);
      date = new Date(Date.parse(postView.record.createdAt));
      time = date;
    }
    const options = {
      title: `${postView.author.displayName} (${postView.author.handle})`,
      displayName: postView.author.displayName,
      handle: postView.author.handle,
      text,
      date: date?.toLocaleDateString(parsedLocale, { year: "numeric", month: "long", day: "numeric" }),
      time: time?.toLocaleTimeString(parsedLocale, { hour: "numeric", minute: "numeric" }),
      avatar: postView.author.avatar,
      thumb,
      link: parsedUrl.toString(),
      likes: postView.likeCount ?? 0,
      reskeets: postView.reskeetCount ?? 0,
      images
    };
    return options;
  } else {
    throw new Error(`Failed to get post ${id}`);
  }
}

async function parseProfile(url, agent) {
  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname;
  const parts = path.split("/");
  const actor = parts[2];
  const profile = await agent.app.bsky.actor.getProfile({ actor });
  if (profile.success) {
    const options = {
      displayName: profile.data.displayName,
      handle: profile.data.handle,
      avatar: profile.data.avatar,
      bio: profile.data.description,
      link: parsedUrl.toString()
    };
    return options;
  } else {
    console.error(`Failed to get profile for ${actor}`);
    throw new Error(`Failed to get profile for ${actor}`);
  }
}

dotenv.config();
const agent = new BskyAgent({
  service: "https://bsky.social"
});
const result = await agent.login({
  identifier: process.env.BSKY_USERNAME,
  password: process.env.BSKY_PASSWORD
});
if (result.success) {
  console.log("Signed in");
} else {
  console.log("Failed to sign in");
  exit(1);
}
const app = express();
process.env.PORT;
app.set("view engine", "hbs");
app.use(express.json());
app.use(express.static("public"));
app.post("/api/skeet", async (req, res) => {
  const url = req.body.url;
  if (!url) {
    res.status(400).send("URL is required");
    return;
  }
  try {
    const result2 = await parseSkeet(url, agent, req.headers["accept-language"]);
    res.json(result2);
  } catch (err) {
    res.status(400).send(`Invalid URL ${url} ${err}`);
  }
});
app.post("/api/profile", async (req, res) => {
  const url = req.body.url;
  if (!url) {
    res.status(400).send("URL is required");
    return;
  }
  try {
    const result2 = await parseProfile(url, agent);
    res.json(result2);
  } catch (err) {
    res.status(400).send(`Invalid URL ${url} ${err}`);
  }
});
app.get("/", async (req, res) => {
  const url = req.query.url;
  res.set("Content-Type", "text/html; charset=UTF-8");
  if (!url) {
    res.render("index");
    return;
  }
  try {
    const pathName = new URL(url).pathname.split("/");
    switch (pathName.length) {
      case 3: {
        const result2 = await parseProfile(url, agent);
        res.render("profile", result2);
        break;
      }
      default: {
        const result2 = await parseSkeet(url, agent, req.headers["accept-language"]);
        res.render("skeet", result2);
        break;
      }
    }
  } catch (err) {
    res.status(400).send(`Invalid URL ${url} ${err}`);
  }
});
app.get("/api/health", async (req, res) => {
  res.send("OK");
});
const viteNodeApp = app;

export { viteNodeApp };
