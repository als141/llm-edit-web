"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, ClipboardPaste, Save, FilePlus, File } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { toast } from "sonner";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FileInput() {
  const { setFileContent } = useEditorStore();
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      readFile(file);
    }
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
      toast.success("ファイル読み込み完了", { 
        description: `${file.name} (${formatFileSize(file.size)})`,
        icon: <File className="h-5 w-5" />
      });
    };
    reader.onerror = (e) => {
      console.error("File reading error:", e);
      toast.error("ファイル読み込みエラー", { 
        description: "ファイルの読み込み中にエラーが発生しました。" 
      });
    };
    reader.readAsText(file, 'UTF-8');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleConfirmText = () => {
    setFileContent(textInput);
    toast.success("テキスト入力確定", { 
      description: `${textInput.length.toLocaleString()}文字のテキストを読み込みました`,
      icon: <FileText className="h-5 w-5" />
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTextInput(text);
      toast.info("クリップボードからテキストをペースト", {
        description: "内容を確認して「確定」ボタンを押してください。",
        icon: <ClipboardPaste className="h-5 w-5" />
      });
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      toast.error("ペースト失敗", { 
        description: "クリップボードからの読み取りに失敗しました。" 
      });
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      readFile(files[0]);
    }
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  }

  return (
    <Card className="shadow-sm" data-dragging={isDragging}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <FilePlus className="h-4 w-4 text-primary" />
          テキストを入力またはファイルを選択
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 py-0">
        <div
          ref={dropzoneRef}
          className={`rounded-md transition-all duration-300 ${
            isDragging 
              ? 'bg-primary/10 border-2 border-dashed border-primary' 
              : 'border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Textarea
            placeholder="ここにテキストを入力またはファイルをドラッグ＆ドロップ..."
            value={textInput}
            onChange={handleTextChange}
            rows={3}
            className="resize-none border-none rounded-md bg-transparent focus-visible:ring-0 p-3"
          />
          
          {fileName && (
            <div className="px-3 py-2 bg-muted/50 rounded-b-md text-xs flex items-center gap-2 border-t border-dashed border-border/50">
              <File className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{fileName}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between px-4 py-3 gap-2">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleConfirmText} size="sm" disabled={!textInput.trim()}>
                  <Save className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">テキストを確定</span>
                  <span className="sm:hidden">確定</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>入力したテキストをエディタに反映します</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handlePaste} size="sm" variant="outline">
                  <ClipboardPaste className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">ペースト</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>クリップボードからテキストを貼り付けます</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={triggerFileInput} variant="secondary" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">ファイルを選択</span>
                <span className="sm:hidden">ファイル</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>テキストファイルを選択してアップロード</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".txt,.md,.json,.py,.js,.ts,.html,.css,text/plain,application/json"
        />
      </CardFooter>
    </Card>
  );
}