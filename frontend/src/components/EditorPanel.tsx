"use client";

import { FileInput } from "@/components/FileInput";
import { useEditorStore } from "@/store/editorStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, FileText, Type } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function EditorPanel() {
  const currentText = useEditorStore(state => state.currentText);
  const fileContent = useEditorStore(state => state.fileContent);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs value={editorView} onValueChange={setEditorView} className="h-full flex flex-col">
        {/* ヘッダー部分 - コンパクト化 */}
        <div className="flex-none p-2 md:p-4 border-b bg-card shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h2 className="text-sm md:text-lg font-medium">テキストエディタ</h2>
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
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {currentText.length > 0 ? `${currentText.length.toLocaleString()} 文字` : ''}
                </span>
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
                    <pre className="text-xs md:text-sm whitespace-pre-wrap break-words font-mono bg-muted/30 p-2 md:p-4 rounded-md">
                      {currentText}
                    </pre>
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