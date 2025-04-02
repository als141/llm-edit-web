"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, ClipboardPaste, Save, FilePlus, File, Check } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // レスポンシブ対応
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初期チェック
    checkScreenSize();
    
    // リサイズイベントリスナー
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleConfirmText = () => {
    if (textInput.trim()) {
      setFileContent(textInput);
      toast.success("テキスト入力確定", { 
        description: `${textInput.length.toLocaleString()}文字のテキストを読み込みました`,
        icon: <FileText className="h-5 w-5" />
      });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTextInput(text);
      toast.info("クリップボードからテキストをペースト", {
        description: "内容を確認して「保存」ボタンを押してください。",
        icon: <ClipboardPaste className="h-5 w-5" />
      });
      
      // テキストエリアにフォーカス
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
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
  }, [readFile]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  }

  // テキスト入力があるかどうか
  const hasText = textInput.trim().length > 0;

  return (
    <Card className="shadow-sm" data-dragging={isDragging}>
      <CardHeader className="py-2 px-3 md:py-3 md:px-4">
        <CardTitle className="text-xs md:text-sm flex items-center gap-1.5 md:gap-2">
          <FilePlus className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
          テキストを入力またはファイルを選択
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-2 md:px-4 py-0">
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
            ref={textareaRef}
            placeholder="ここにテキストを入力またはファイルをドラッグ＆ドロップ..."
            value={textInput}
            onChange={handleTextChange}
            rows={isMobile ? 4 : 3}
            className="resize-none border-none rounded-md bg-transparent focus-visible:ring-0 p-2 md:p-3 text-xs md:text-sm"
          />
          
          {fileName && (
            <div className="px-2 md:px-3 py-1 md:py-1.5 bg-muted/50 rounded-b-md text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 border-t border-dashed border-border/50">
              <File className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium truncate">{fileName}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-2 md:px-4 py-2 md:py-3">
        {isMobile ? (
          // モバイル用のアクションボタン
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              onClick={handleConfirmText} 
              size="sm" 
              disabled={!hasText}
              variant="default"
              className="h-9 text-xs flex items-center justify-center shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center gap-1.5">
                <Save className="h-4 w-4" />
                <span>テキストを保存</span>
              </div>
            </Button>
            
            <Button 
              onClick={triggerFileInput} 
              variant="secondary" 
              size="sm" 
              className="h-9 text-xs flex items-center justify-center shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center gap-1.5">
                <Upload className="h-4 w-4" />
                <span>ファイルを選択</span>
              </div>
            </Button>
            
            <Button 
              onClick={handlePaste} 
              size="sm"
              variant="outline"
              className="h-9 text-xs col-span-2 flex items-center justify-center shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center gap-1.5">
                <ClipboardPaste className="h-4 w-4" />
                <span>ペースト</span>
              </div>
            </Button>
          </div>
        ) : (
          // デスクトップ用のアクションボタン - ボタンを縦に配置
          <div className="flex flex-col w-full gap-2">
            <div className="grid grid-cols-2 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleConfirmText} 
                      size="sm" 
                      disabled={!hasText}
                      className={`h-9 w-full transition-all ${hasText ? 'bg-primary hover:bg-primary/90 shadow-sm' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {hasText ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                        <span>テキストを保存</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>入力したテキストをエディタに保存します</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handlePaste} 
                      size="sm" 
                      variant="outline"
                      className="h-9 w-full shadow-sm"
                    >
                      <div className="flex items-center gap-1.5">
                        <ClipboardPaste className="h-4 w-4" />
                        <span>ペースト</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>クリップボードからテキストを貼り付けます</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={triggerFileInput} 
                    variant="secondary" 
                    size="sm"
                    className="h-9 w-full shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 justify-center">
                      <Upload className="h-4 w-4" />
                      <span>ファイルをアップロード</span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>テキストファイルを選択してアップロード</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
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