const fs = require("fs");
const path = require("path");

function generateCppWrapper(userCode, problemMeta) {
  const inputParser = problemMeta.inputParser.cpp;
  const outputPrinter = problemMeta.outputPrinter.cpp;
  const argsList = problemMeta.functionArgs.map((a) => a.name).join(", ");
  const functionName = problemMeta.functionName;

  return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

// User function
${userCode}

// wrapper
int main() {
    ${inputParser}
    auto result = ${functionName}(${argsList});
    ${outputPrinter}
    return 0;
}
`;
}

function saveCppFile(code, tmpDir) {
  const filename = `code_${Date.now()}.cpp`;
  const filePath = path.join(tmpDir, filename);
  fs.writeFileSync(filePath, code);
  return filePath;
}

module.exports = { generateCppWrapper, saveCppFile };
