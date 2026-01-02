import React, { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import AIAssistButton from './AIAssistButton';
import AIAssistMenu from './AIAssistMenu';

interface LatexEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  editorRef?: React.MutableRefObject<any>;
  onAutoCompile?: (newCode: string) => void;
}

export default function LatexEditor({ code, onChange, editorRef, onAutoCompile }: LatexEditorProps) {
  const [aiButtonPos, setAiButtonPos] = useState<{ top: number; left: number } | null>(null);
  const [aiMenuPos, setAiMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Local ref to store editor instance if not provided via props
  const localEditorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    if (editorRef) {
      editorRef.current = editor;
    }
    localEditorRef.current = editor;

    editor.onDidChangeCursorSelection((e) => {
      handleSelectionChange(editor);
    });
    
    // Hide AI tools on scroll or type
    editor.onDidScrollChange(() => {
      setAiButtonPos(null);
      setAiMenuPos(null);
    });
    
    editor.onDidChangeModelContent(() => {
      if (!isAiLoading) {
        setAiButtonPos(null);
        setAiMenuPos(null);
      }
    });
  };

  const handleSelectionChange = (editor: any) => {
    const selection = editor.getSelection();
    if (!selection || selection.isEmpty()) {
      setAiButtonPos(null);
      setAiMenuPos(null);
      return;
    }

    const model = editor.getModel();
    const text = model.getValueInRange(selection);

    if (!text.trim()) {
      setAiButtonPos(null);
      return;
    }

    setSelectedText(text);

    // Get position for the button
    const position = editor.getScrolledVisiblePosition(selection.getEndPosition());
    if (position) {
      // Adjust position to be near the selection end
      setAiButtonPos({ 
        top: position.top, 
        left: position.left + 20 
      });
      // Hide menu if selection changes
      setAiMenuPos(null);
    }
  };

  const handleAiButtonClick = () => {
    if (aiButtonPos) {
      setAiMenuPos(aiButtonPos);
      setAiButtonPos(null);
    }
  };

  const handleAiAction = async (action: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/gemini/improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: selectedText
        })
      });

      const data = await res.json();
      
      if (data.result) {
        applyAIResult(data.result);
      } else {
        console.error("No result from AI");
      }
    } catch (error) {
      console.error("AI Action failed:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAIResult = (result: string) => {
    const editor = localEditorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    
    // Push to undo stack
    editor.pushUndoStop();
    
    editor.executeEdits("ai-assist", [
      {
        range: selection,
        text: result,
        forceMoveMarkers: true
      }
    ]);
    
    editor.pushUndoStop();
    editor.focus();

    setAiMenuPos(null);
    setAiButtonPos(null);

    if (onAutoCompile) {
      onAutoCompile(editor.getValue());
    }
  };

  return (
    <div className="h-full w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-inner relative group">
      <Editor
        height="100%"
        defaultLanguage="latex"
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme="light"
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          automaticLayout: true,
          fontSize: 14,
          lineHeight: 24,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          scrollBeyondLastLine: false,
          padding: { top: 24, bottom: 24 },
          renderLineHighlight: 'all',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
        }}
      />
      
      <AIAssistButton 
        position={aiButtonPos} 
        onClick={handleAiButtonClick} 
      />
      
      <AIAssistMenu 
        position={aiMenuPos} 
        onAction={handleAiAction} 
        onClose={() => setAiMenuPos(null)}
        isLoading={isAiLoading}
      />
    </div>
  );
}
