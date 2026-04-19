import React, { useRef } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { judgeCode, runCode } from "../services/codeService";
import ResultsModal from "./ResultsModal";
import { JudgingResult } from "../types/codingProblem";
import { setDone } from "../services/exerciseService";
import { useAuth } from "../context/AuthContext";

interface CodeEditorProps {
  language: string;
  startCode?: string;
  problemId: string;
  problemQuestion?: string;
  problemDescription?: string;
  courseId: string;

}

const editorSettings = {
  theme: "vs-dark",
  fontSize: 16,
  lineHeight: 24,
  wordWrap: "on",
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  startCode,
  problemId,
  problemQuestion,
  problemDescription,
  courseId,

}) => {

    const [results, setResults] = React.useState<null | JudgingResult[]>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const {userProfile} = useAuth()
    const userId = userProfile?.uid || "null"
    const [attempts, setAttempts] = React.useState<number>(0);
    
  const webViewRef = useRef<WebView>(null);

  const onMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.command === "submitCode") {
        console.log("Submitted Code:", data.data);
        const result = await judgeCode(data.data, language, problemId);
        const message = result.results
        setResults(message);
        setModalVisible(true);
        if(result.results.length === result.passed){
            setAttempts(attempts + 1);
            setDone(courseId, problemId, attempts, userId)
        }
        else{
            setAttempts(attempts + 1);
        }
      }
    } catch (err) {
      console.error("Failed to parse message from WebView:", err);
    }
  };
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Monaco Editor</title>
<script src="https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js"></script>
<style>
  body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  #editor {
    flex: 1;
    min-height: 0;
  }
  #controlsDiv {
    display: flex;
    gap: 10px;
    padding: 10px;
    background-color: #1e1e1e;
    align-items: center;
    justify-content: flex-end;
  }
  #submitButton {
    padding: 8px 16px;
    background-color: #007acc;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  #submitButton:hover {
    background-color: #005a9e;
  }
</style>
</head>
<body>
<div id="controlsDiv">
  <button id="submitButton">Submit</button>
</div>
<div id="editor"></div>

<script>
require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    value: [
      '${startCode || ""}'
    ].join('\\n'),
    language: '${language}',
    theme: '${editorSettings.theme}',
    domReadOnly: false,
    readOnly: false,
    fontSize: ${editorSettings.fontSize},
    lineHeight: ${editorSettings.lineHeight},
    wordWrap: '${editorSettings.wordWrap}',
    minimap : { enabled: false },
    automaticLayout: true,
    scrollbar:{
      vertical: 'hidden',
      horizontal: 'hidden'
    },
    glyphMargin: false,
    folding: false,
    lineNumbersMinChars: 2,
    lineDecorationsWidth: 0,

  // optional polish
  scrollBeyondLastLine: false
  });
  
  document.getElementById('submitButton').addEventListener('click', () => {
    const code = window.editor.getValue();
    window.ReactNativeWebView.postMessage(JSON.stringify({
      command: 'submitCode',
      data: code
    }));
  });

  // Focus on editor when it's loaded
  window.editor.focus();
});

</script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <Text
        style={{
          color: "white",
          padding: 10,
          backgroundColor: "#1e1e1e",
          textAlign: "center",
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        {problemQuestion || "Code Challenge"}
      </Text>
      <Text
        style={{
          color: "white",
          padding: 10,
          backgroundColor: "#1e1e1e",
          textAlign: "center",
          fontSize: 16,
        }}
      >
        {problemDescription || "Description not available"}
      </Text>
      <WebView
        ref={webViewRef}
        onMessage={onMessage}
        keyboardDisplayRequiresUserAction={false}
        source={{
          html: html,
        }}
        style={styles.webview}
      />
        <ResultsModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            results={results}
            />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default CodeEditor;
