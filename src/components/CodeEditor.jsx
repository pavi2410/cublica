import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

function CodeEditor({ code, onChange, onRun }) {
  const stats = useMemo(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    const words = code.split(/\s+/).filter(Boolean).length;
    return { lines, chars, words };
  }, [code]);
  
  const handleChange = (value) => {
    onChange(value);
  };
  
  return (
    <>
      <div className="code-editor-container">
        <CodeMirror
          value={code}
          height="300px"
          extensions={[javascript({ jsx: true })]}
          onChange={handleChange}
          theme="dark"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true
          }}
          className="code-mirror-wrapper"
        />
      </div>
      
      {/* Code statistics */}
      <div className="code-stats">
        <span>Lines: {stats.lines}</span>
        <span>Words: {stats.words}</span>
        <span>Characters: {stats.chars}</span>
      </div>
      
      {/* Run button */}
      <div className="code-run-button" onClick={onRun}>▶ Run Code</div>
    </>
  );
}

export default CodeEditor;
