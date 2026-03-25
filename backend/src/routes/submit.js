const express = require("express");
const router = express.Router();
const judgeSubmission = require("../judge");



router.post("/", (req, res) => {
  const { language, code, problemId } = req.body;

  if (!language || !code || !problemId) {
    return res.status(400).json({ error: "Missing fields or invalid data" });
  }

  judgeSubmission(language, code, problemId, result => {
    res.json(result);
  });
});

module.exports = router;