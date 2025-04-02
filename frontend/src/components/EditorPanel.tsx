"use client";

import { FileInput } from "@/components/FileInput";
import { useEditorStore } from "@/store/editorStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CodeIcon, FileText, Type, Pencil, Save, XCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function EditorPanel() {
  const { 
    currentText, 
    fileContent, 
    isEditing, 
    startEditing, 
    cancelEditing, 
    saveEditing,
  } = useEditorStore((state) => state);

  const [isMobile, setIsMobile] = useState(false);
  const [editedText, setEditedText] = useState(currentText);
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editorView, setEditorView] = useState(fileContent ? "editor" : "input");
  
  // レスポンシブ対応: モバイルかどうかを検出
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

  // 編集状態が変わった時に編集テキストを更新
  useEffect(() => {
    if (isEditing) {
      setEditedText(currentText);
      // 編集モードになったらテキストエリアにフォーカス
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isEditing, currentText]);

  // 現在のテキストが変わったら編集テキストも更新（編集モードでない時）
  useEffect(() => {
    if (!isEditing) {
      setEditedText(currentText);
    }
  }, [currentText, isEditing]);

  // ファイルコンテンツが更新されたらエディタビューに切り替え
  useEffect(() => {
    if (fileContent) {
      setEditorView("editor");
    }
  }, [fileContent]);

  // 適切な最大高さをcssプロパティとして取得（フッターなしの調整）
  const getMaxHeightStyle = () => {
    return {
      maxHeight: isMobile 
        ? 'calc(100vh - 150px)' // フッターなしのモバイル向け（ヘッダー+タブ+入力フォームの高さを考慮）
        : 'calc(100vh - 160px)' // フッターなしのデスクトップ向け
    };
  };

  // 編集の保存
  const handleSaveEditing = () => {
    if (editedText !== currentText) {
      saveEditing(editedText);
      toast.success("テキストを保存しました", {
        description: "手動編集の内容が保存されました",
        icon: <Save className="h-5 w-5" />
      });
    } else {
      cancelEditing();
    }
  };

  // 編集のキャンセル
  const handleCancelEditing = () => {
    cancelEditing();
    setEditedText(currentText);
    toast.info("編集をキャンセルしました", {
      icon: <XCircle className="h-5 w-5" />
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs value={editorView} onValueChange={setEditorView} className="h-full flex flex-col">
        {/* ヘッダー部分 - ChatPanelとスタイルを完全に統一 */}
        <div className="flex-none h-14 md:h-16 px-3 py-2 md:px-4 md:py-3 border-b bg-card shadow-sm z-10">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 md:h-6 md:w-6 text-primary">
                <FileText className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <h2 className="text-sm md:text-base font-medium">テキストエディタ</h2>
            </div>
            <TabsList className="bg-muted/40 h-7 md:h-8">
              <TabsTrigger 
                value="input" 
                className="flex items-center gap-1 h-6 md:h-7 px-2 md:px-3 text-xs"
              >
                <Type className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="hidden xs:inline">入力</span>
              </TabsTrigger>
              <TabsTrigger 
                value="editor" 
                className="flex items-center gap-1 h-6 md:h-7 px-2 md:px-3 text-xs"
              >
                <FileText className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="hidden xs:inline">プレビュー</span>
              </TabsTrigger>
              <TabsTrigger 
                value="raw" 
                className="flex items-center gap-1 h-6 md:h-7 px-2 md:px-3 text-xs"
              >
                <CodeIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="hidden xs:inline">Raw</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        {/* コンテンツ部分 - パディング最適化 */}
        <div 
          ref={contentRef}
          className="flex-grow p-2 md:p-4 overflow-y-auto scrollbar-thin editor-content"
        >
          <TabsContent value="input" className="space-y-2 md:space-y-4 mt-0 h-full animate-in fade-in-5 duration-300">
            {/* ファイル入力部分 */}
            <FileInput />
          </TabsContent>
          
          <TabsContent value="editor" className="mt-0 h-full animate-in fade-in-5 duration-300">
            {/* テキストエディタ部分 */}
            <div className="border rounded-md shadow-sm bg-card">
              <div className="py-1.5 px-3 md:py-2 md:px-4 border-b flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-medium">現在のテキスト</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] md:text-xs text-muted-foreground">
                    {currentText.length > 0 ? `${currentText.length.toLocaleString()} 文字` : ''}
                  </span>
                  
                  {/* 編集ボタン */}
                  {!isEditing && currentText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full"
                      onClick={startEditing}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="sr-only">編集</span>
                    </Button>
                  )}
                </div>
              </div>
              
              <div style={getMaxHeightStyle()} className="overflow-y-auto">
                {fileContent === '' ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center p-4 md:p-8 h-32 md:h-48">
                    <FileText className="h-8 w-8 md:h-12 md:w-12 mb-3 md:mb-4 text-muted-foreground/25" />
                    <p className="text-center max-w-md text-xs md:text-sm">
                      テキストを入力またはファイルをアップロードしてください。
                      AIが編集の手助けをします。
                    </p>
                  </div>
                ) : (
                  <div className="p-2 md:p-4">
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.div
                          key="editing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3"
                        >
                          <Textarea
                            ref={textareaRef}
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="min-h-[200px] font-mono text-xs md:text-sm border-primary/20 resize-y"
                            placeholder="テキストを編集..."
                          />
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEditing}
                              className="text-xs md:text-sm h-8"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              キャンセル
                            </Button>
                            
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSaveEditing}
                              className="text-xs md:text-sm h-8"
                              disabled={editedText === currentText}
                            >
                              <Save className="h-3.5 w-3.5 mr-1.5" />
                              保存
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.pre
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "text-xs md:text-sm whitespace-pre-wrap break-words font-mono",
                            "bg-muted/30 p-2 md:p-4 rounded-md"
                          )}
                        >
                          {currentText}
                        </motion.pre>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-0 h-full animate-in fade-in-5 duration-300">
            <div className="border rounded-md shadow-sm bg-card">
              <div style={getMaxHeightStyle()} className="overflow-y-auto">
                {fileContent === '' ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center p-4 md:p-8 h-32 md:h-48">
                    <CodeIcon className="h-8 w-8 md:h-12 md:w-12 mb-3 md:mb-4 text-muted-foreground/25" />
                    <p className="text-center text-xs md:text-sm">テキストが入力されていません</p>
                  </div>
                ) : (
                  <pre className="p-2 md:p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                    {currentText}
                  </pre>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}