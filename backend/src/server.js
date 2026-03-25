const express = require("express");
const runRoute = require("./routes/run");
const submitRoute = require("./routes/submit");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next();
});

app.use("/run", runRoute);
app.use("/submit", submitRoute);

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
