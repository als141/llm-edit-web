"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, ClipboardPaste } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
// ↓↓↓ sonnerからtoast関数をインポート ↓↓↓
import { toast } from "sonner";

export function FileInput() {
  const { setFileContent } = useEditorStore();
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  // ↓↓↓ useToast は削除 ↓↓↓
  // const { toast } = useToast();

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readFile(file);
    }
     // 同じファイルを選択した場合も change イベントを発火させるため value をクリア
     if (event.target) {
        event.target.value = '';
     }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
       setTextInput(content);
       // ↓↓↓ sonnerのtoast関数を使用 ↓↓↓
       toast.success("ファイル読み込み完了", { description: file.name });
    };
    reader.onerror = (e) => {
        console.error("File reading error:", e);
        // ↓↓↓ sonnerのtoast関数を使用 ↓↓↓
        toast.error("ファイル読み込みエラー", { description: "ファイルの読み込み中にエラーが発生しました。" });
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmText = () => {
    setFileContent(textInput);
     // ↓↓↓ sonnerのtoast関数を使用 ↓↓↓
     toast.success("テキスト入力確定", { description: `約${textInput.length}文字` });
  };

   const handlePaste = async () => {
     try {
       const text = await navigator.clipboard.readText();
       setTextInput(text);
       // ↓↓↓ sonnerのtoast関数を使用 ↓↓↓
       toast.info("クリップボードからテキストをペーストしました。", {
           description: "内容を確認して「確定」ボタンを押してください。",
       });
     } catch (err) {
       console.error('Failed to read clipboard contents: ', err);
       // ↓↓↓ sonnerのtoast関数を使用 ↓↓↓
       toast.error("ペースト失敗", { description: "クリップボードからの読み取りに失敗しました。" });
     }
   };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropzoneRef.current) {
        dropzoneRef.current.classList.add('border-primary', 'bg-primary/10'); // スタイル変更
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
     if (dropzoneRef.current) {
        dropzoneRef.current.classList.remove('border-primary', 'bg-primary/10');
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
     if (dropzoneRef.current) {
        dropzoneRef.current.classList.remove('border-primary', 'bg-primary/10');
    }
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  // readFileが外部で定義されている場合、依存関係に含める
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFileContent]); // readFile内でsetFileContentを使っているので依存関係に追加

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  }

  return (
    <div
        ref={dropzoneRef}
        className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 space-y-3 bg-muted/20 transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {/* <Label htmlFor="text-input-area">テキスト入力 または ファイル選択/ドロップ</Label> */}
      <div className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-2">
        <Textarea
          id="text-input-area"
          placeholder="ここにテキストを入力またはペースト..."
          value={textInput}
          onChange={handleTextChange}
          rows={4} // 少し高さを確保
          className="flex-grow bg-background shadow-sm"
        />
        <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 w-full md:w-auto">
            <Button onClick={handleConfirmText} size="sm" className="flex-grow md:flex-grow-0 md:w-[100px]" disabled={!textInput}>
              <FileText className="h-4 w-4 mr-1" /> 確定
            </Button>
            <Button onClick={handlePaste} size="sm" variant="outline" className="flex-grow md:flex-grow-0 md:w-[100px]">
                <ClipboardPaste className="h-4 w-4 mr-1" /> ペースト
            </Button>
        </div>
      </div>
       {/* <div className="text-center text-sm text-muted-foreground">または</div> */}
       <Button onClick={triggerFileInput} variant="outline" className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          ファイルを選択 または ドラッグ＆ドロップ (.txt, .md など)
       </Button>
       <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".txt,.md,.json,.py,.js,.ts,.html,.css,text/plain,application/json" // 受け付けるファイルタイプ
        />
      {/* <p className="text-center text-xs text-muted-foreground">ファイルをここにドラッグ＆ドロップすることもできます。</p> */}
    </div>
  );
}