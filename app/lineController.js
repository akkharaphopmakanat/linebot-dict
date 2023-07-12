const express = require("express");
const line = require("@line/bot-sdk");
const { handleEvent } = require("./lineService");
const dotenv = require("dotenv");
const env = dotenv.config().parsed;
const router = express.Router();
const lineConfig = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_TOKEN,
};
const client = new line.Client(lineConfig);

router.post("/webhook", line.middleware(lineConfig), async (req, res, next) => {
  try {
    const events = req.body.events;
    console.log("event", events);
    if (events.length > 0) {
      await Promise.all(events.map((item) => handleEvent(item, client)));
    } else {
      res.status(200).send("OK");
    }

    if (req.session.user) return next();
    return next(new NotAuthorizedError());
  } catch (e) {
    res.status(500).end();
  }
});

module.exports = router;
