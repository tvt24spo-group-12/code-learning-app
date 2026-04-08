const API_KEY = process.env.API_KEY
require("dotenv").config();

function apiKeyMiddleware(req, res, next) {
  const key = req.headers["x-api-key"]; 

  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }

  next();
}

module.exports = apiKeyMiddleware;