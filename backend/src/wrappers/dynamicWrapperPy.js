const fs = require("fs");
const path = require("path");

function generatePythonWrapper(userCode, problemMeta) {
  const inputParser = problemMeta.inputParser.python;
  const outputPrinter = problemMeta.outputPrinter.python;
  const functionName = problemMeta.functionName;
  const argsList = problemMeta.functionArgs.map((a) => a.name).join(", ");

  return `
${userCode}


${inputParser}
result = ${functionName}(${argsList})
${outputPrinter}
`;
}

function savePythonFile(code, tmpDir) {
  const filename = `code_${Date.now()}.py`;
  const filePath = path.join(tmpDir, filename);
  fs.writeFileSync(filePath, code);
  return filePath;
}

module.exports = { generatePythonWrapper, savePythonFile };