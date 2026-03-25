const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const {
  ensureContainer,
  containers,
  runDocker,
} = require("./containerManager");
const {
  generateCppWrapper,
  saveCppFile,
} = require("./wrappers/dynamicWrapperCpp");
const {
  generatePythonWrapper,
  savePythonFile,
} = require("./wrappers/dynamicWrapperPy");

const ALLOWED_LANGUAGES = ["python", "javascript", "cpp"];
const MAX_CODE_SIZE = 50000;
const TMP_DIR = path.join(__dirname, "..", "..", "tmp");

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

function getExt(lang) {
  return { python: "py", javascript: "js", cpp: "cpp" }[lang];
}

async function runCode(language, userCode, stdin, problemMeta, callback) {
  try {
    if (!ALLOWED_LANGUAGES.includes(language))
      return callback("Error: Unsupported language");
    if (typeof userCode !== "string" || userCode.length > MAX_CODE_SIZE)
      return callback("Error: Code too long");
    if (stdin && typeof stdin !== "string")
      return callback("Error: Invalid stdin");

    await ensureContainer(language);

    let filePath;
    if (language === "cpp" && problemMeta) {
      const wrappedCode = generateCppWrapper(userCode, problemMeta);
      filePath = saveCppFile(wrappedCode, TMP_DIR);
    } else if (language === "python" && problemMeta) {
      const wrappedCode = generatePythonWrapper(userCode, problemMeta);
      filePath = savePythonFile(wrappedCode, TMP_DIR);
    } else {
      const filename = `code_${Date.now()}.${getExt(language)}`;
      filePath = path.join(TMP_DIR, filename);
      fs.writeFileSync(filePath, userCode);
    }

    const containerFilePath = `/tmp/${path.basename(filePath)}`;
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
        `g++ -O0 ${containerFilePath} -o /tmp/output && /tmp/output`,
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

    let output = "",
      error = "";
    proc.stdout.on("data", (d) => (output += d));
    proc.stderr.on("data", (d) => (error += d));

    proc.stdin.write(stdin || "");
    proc.stdin.end();

    const timeout = setTimeout(() => proc.kill("SIGKILL"), 5000);

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
            "/tmp/output",
          ]);
        } catch {}
      }

      try {
        fs.unlinkSync(filePath);
      } catch {}

      callback((error || output).slice(0, 100000).replace(/\x00/g, ""));
    });
  } catch (err) {
    callback(err.message);
  }
}

module.exports = runCode;
