const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const {
  ensureContainer,
  containers,
  runDocker,
} = require("./containerManager");

const ALLOWED_LANGUAGES = ["python", "javascript", "cpp"];
const MAX_CODE_SIZE = 50000;
const TMP_DIR = path.join(__dirname, "..", "..", "tmp");

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function runCode(language, code, stdin, callback) {
  (async () => {
    try {
      if (!ALLOWED_LANGUAGES.includes(language)) {
        return callback("Error: Unsupported language");
      }
      if (typeof code !== "string" || code.length > MAX_CODE_SIZE) {
        return callback("Error: Invalid code size (max 50KB)");
      }
      if (stdin && typeof stdin !== "string") {
        return callback("Error: Invalid stdin");
      }

      await ensureContainer(language);

      const filename = `code_${Date.now()}.${getExt(language)}`;
      const filePath = path.join(TMP_DIR, filename);

      fs.writeFileSync(filePath, code);

      const containerFilePath = `/tmp/${filename}`;
      await runDocker([
        "cp",
        filePath,
        `${containers[language].name}:${containerFilePath}`,
      ]);

      let cmd;

      if (language === "cpp") {
        cmd = [
          "exec",
          "-i",
          containers[language].name,
          "bash",
          "-c",
          `cd /home && g++ -O0 ${containerFilePath} -o ./output && ./output`,
        ];
      } else if (language === "python") {
        cmd = [
          "exec",
          "-i",
          containers[language].name,
          "python",
          containerFilePath,
        ];
      } else {
        cmd = [
          "exec",
          "-i",
          containers[language].name,
          "node",
          containerFilePath,
        ];
      }

      const proc = spawn("docker", cmd);

      let output = "";
      let error = "";

      proc.stdout.on("data", (d) => (output += d));
      proc.stderr.on("data", (d) => (error += d));

      proc.stdin.write(stdin || "");
      proc.stdin.end();

      const timeout = setTimeout(() => {
        proc.kill("SIGKILL");
      }, 5000);

      proc.on("close", async () => {
        clearTimeout(timeout);

        try {
          await runDocker([
            "exec",
            containers[language].name,
            "rm",
            "-f",
            containerFilePath,
          ]);
        } catch {}

        if (language === "cpp") {
          try {
            await runDocker([
              "exec",
              containers[language].name,
              "rm",
              "-f",
              "/home/output",
            ]);
          } catch {}
        }

        try {
          fs.unlinkSync(filePath);
        } catch {}

        const sanitizedOutput = (error || output)
          .slice(0, 100000)
          .replace(/\x00/g, "");

        callback(sanitizedOutput);
      });
    } catch (err) {
      callback(err.message);
    }
  })();
}

function getExt(lang) {
  return {
    python: "py",
    javascript: "js",
    cpp: "cpp",
  }[lang];
}

module.exports = runCode;
