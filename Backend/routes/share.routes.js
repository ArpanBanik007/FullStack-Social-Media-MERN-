import express from "express";
import Post from "../models/createpost.models.js";
const router = express.Router();

const BOT_UA_REGEX = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|slackbot/i;
const ogCache = new Map();

router.get("/share/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const isBot = BOT_UA_REGEX.test(req.headers["user-agent"] || "");

  // ── Real user hole — direct frontend e redirect ──
  if (!isBot) {
    return res.redirect(`${process.env.FRONTEND_URL}/${type}/single/${id}`);
  }

  // ── Cache check (bot-er jonye) ──
  const cacheKey = `${type}:${id}`;
  if (ogCache.has(cacheKey)) {
    return res.send(ogCache.get(cacheKey));
  }

  // ── Type onujayi correct model theke data fetch ──
  let title, image, url;

  if (type === "post") {
    const post = await Post.findById(id).populate("createdBy", "username");
    if (!post) return res.status(404).send("Not found");

    title = post.title?.slice(0, 60) || `Post by @${post.createdBy?.username || "Deleted User"}`;
    image = post.posturl || `${process.env.FRONTEND_URL}/default-og-image.png`;
    url = `${process.env.FRONTEND_URL}/post/single/${post._id}`;
  } else {
    // Future e "photo" ba onno type add korle ekhane else-if diye barabe
    return res.status(400).send("Invalid share type");
  }

  const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="${title}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:url" content="${url}" />
        <meta property="og:type" content="article" />
        <meta property="og:description" content="See this on Pluto" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body></body>
    </html>`;

  ogCache.set(cacheKey, html);
  setTimeout(() => ogCache.delete(cacheKey), 10 * 60 * 1000);
  res.send(html);
});

export default router;