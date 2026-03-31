const express = require("express");
const router = express.Router();
const judgeSubmission = require("../judge");

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

router.post("/", (req, res) => {
  const { language, code, problemId } = req.body;

  if (!language || !code || !problemId) {
    return res.status(400).json({ error: "Missing fields or invalid data" });
  }

  if (!checkRateLimit(req.ip)) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  judgeSubmission(language, code, problemId, (result) => {
    res.json(result);
  });
});

module.exports = router;
