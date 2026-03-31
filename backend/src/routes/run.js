const express = require("express");
const router = express.Router();
const runCode = require("../codeRunner");

const requestCounts = new Map();
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(ip) {
  const now = Date.now();
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const times = requestCounts.get(ip);

  const recentRequests = times.filter((t) => now - t < RATE_LIMIT_WINDOW);
  requestCounts.set(ip, recentRequests);

  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  recentRequests.push(now);
  return true;
}

//const API_KEY = "secret123";

router.post("/", async (req, res) => {
  const clientIp = req.ip;
  if (!checkRateLimit(clientIp)) {
    return res
      .status(429)
      .json({ error: "Too many requests (max 10 per minute)" });
  }

  const { language, code, stdin } = req.body;

  if (!language || !code) {
    return res.status(400).send("Missing fields language or code");
  }

  const start = Date.now();

  try {
    const output = await runCode(language, code, stdin);
    const time = Date.now() - start;

    res.send({
      output,
      time,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
