const runCode = require("./codeRunner");
const path = require("path");
const fs = require("fs");

const PROBLEMS_PATH = path.join(__dirname, "..", "data", "problems.json");
const problems = JSON.parse(fs.readFileSync(PROBLEMS_PATH, "utf-8"));

async function judgeSubmission(language, userCode, problemId) {
  const problemMeta = problems.find(p => p.id === problemId);
  if (!problemMeta) throw new Error("Problem metadata not found");

  const results = [];
  let passedCount = 0;

  for (const test of problemMeta.testCases) {
    const start = Date.now();

    try {
      const output = await runCode(language, userCode, test.input, problemMeta);
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
    } catch (err) {
      const elapsedTime = Date.now() - start;
      results.push({
        input: test.input,
        expected: test.expectedOutput,
        output: err.message,
        passed: false,
        time: elapsedTime
      });
    }
  }

  return {
    total: problemMeta.testCases.length,
    passed: passedCount,
    results
  };
}

module.exports = judgeSubmission;