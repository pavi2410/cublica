import { useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import ColorStrip from './ColorStrip';

function CodeEditor({ code, onChange, onRun }) {
  const editorRef = useRef(null);
  
  const stats = useMemo(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    const words = code.split(/\s+/).filter(Boolean).length;
    return { lines, chars, words };
  }, [code]);
  
  const handleChange = (value) => {
    onChange(value);
  };
  
  const handleColorSelect = (colorId) => {
    // Insert the color code at the cursor position
    // Since we can't directly access the cursor position in CodeMirror,
    // we'll insert the color code at the end of the current line or create a new assignment
    const newCode = insertColorCode(code, colorId);
    onChange(newCode);
  };
  
  // Helper function to insert color code into the editor
  const insertColorCode = (currentCode, colorId) => {
    // Simple approach: append to the end or replace an existing c = value
    const lines = currentCode.split('\n');
    const colorAssignment = `c = ${colorId}`;
    
    // Check if there's already a line with c = something
    const assignmentLineIndex = lines.findIndex(line => /^\s*c\s*=\s*\d+/.test(line));
    
    if (assignmentLineIndex >= 0) {
      // Replace the existing assignment
      lines[assignmentLineIndex] = colorAssignment;
    } else {
      // Add a new assignment at the beginning
      lines.unshift(colorAssignment);
    }
    
    return lines.join('\n');
  };
  
  return (
    <>
      <div className="code-editor-container">
        <CodeMirror
          ref={editorRef}
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
        <div className="color-strip-container">
          <ColorStrip onColorSelect={handleColorSelect} />
        </div>
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
