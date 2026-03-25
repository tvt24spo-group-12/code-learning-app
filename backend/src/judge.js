const runCode = require("./codeRunner");
const path = require("path");
const fs = require("fs");

const PROBLEMS_PATH = path.join(__dirname, "..", "data", "problems.json");
const problems = JSON.parse(fs.readFileSync(PROBLEMS_PATH, "utf-8"));

async function judgeSubmission(language, userCode, problemId, callback) {
  const problemMeta = problems.find(p => p.id === problemId);
  if (!problemMeta && language === "cpp") return callback({ error: "Problem metadata not found" });

  const results = [];
  let passedCount = 0;

  for (const test of problemMeta.testCases) {
    await new Promise(resolve => {
      const start = Date.now();

      runCode(language, userCode, test.input, problemMeta, output => {
        const elapsedTime = Date.now() - start;
        const normalizedOutput = output.trim();
        const normalizedExpected = test.expectedOutput.trim();
        const passed = normalizedOutput === normalizedExpected;

        if (passed) passedCount++;

        results.push({
          input: test.input,
          expected: test.expectedOutput,
          output,
          passed,
          time: elapsedTime
        });

        resolve();
      });
    });
  }

  callback({
    total: problemMeta.testCases.length,
    passed: passedCount,
    results
  });
}

module.exports = judgeSubmission;