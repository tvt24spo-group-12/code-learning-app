const { spawn } = require("child_process");
const path = require("path");

const containers = {
  python: {
    name: "python_runner",
    image: "python:3.11",
  },
  javascript: {
    name: "node_runner",
    image: "node:20",
  },
  cpp: {
    name: "cpp_runner",
    image: "gcc",
  },
};

function runDocker(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("docker", args);

    let out = "";
    let err = "";

    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (err += d));
    proc.on("error", (error) => reject(error));

    proc.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err || `Docker exited with code ${code}`));
    });
  });
}

async function ensureContainer(lang) {
  const config = containers[lang];
  if (!config) throw new Error("Unsupported language");
}

module.exports = { ensureContainer, containers, runDocker };
