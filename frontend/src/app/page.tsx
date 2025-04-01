"use client";

import { useState, useEffect, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { ChatPanel } from "@/components/ChatPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { useEditorStore } from "@/store/editorStore";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ModeToggle";
import { Bot, FileText } from "lucide-react";

export default function Home() {
  const error = useEditorStore((state) => state.error);
  const clearError = useEditorStore((state) => state.clearError);
  const fileContent = useEditorStore((state) => state.fileContent);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const mainContentRef = useRef<HTMLDivElement>(null);

  // ウィンドウサイズの変更を検知
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

  // テキストが入力されたらエディタパネルを優先表示
  useEffect(() => {
    if (fileContent) {
      setActiveTab("editor");
    }
  }, [fileContent]);

  // エラーが発生したらトーストで表示
  useEffect(() => {
    if (error) {
      toast.error("エラーが発生しました", {
        description: error,
        duration: 5000,
        action: {
          label: "閉じる",
          onClick: () => clearError(),
        },
      });
    }
  }, [error, clearError]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ヘッダーバー - コンパクト化 */}
      <header className="flex-none flex items-center justify-between border-b px-3 md:px-6 py-2 md:py-3 bg-card z-10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-xs md:text-sm">AI</span>
          </div>
          <h1 className="text-base md:text-xl font-bold tracking-tight">新大陸 AIテキストエディタ</h1>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
        </div>
      </header>

      {/* メインコンテンツエリア - フッターなしで高さ100% */}
      <div className="flex-grow overflow-hidden" ref={mainContentRef}>
        {isMobile ? (
          // モバイル表示: タブで切り替え - フッターなしで高さ調整
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex-none border-b bg-card/50 px-3 pt-1 pb-0 sticky top-0 z-10">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-1 h-8 px-2 py-0 text-xs">
                  <Bot className="h-3.5 w-3.5" />
                  <span>AIチャット</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center gap-1 h-8 px-2 py-0 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  <span>エディタ</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-grow overflow-hidden flex flex-col">
              <TabsContent value="chat" className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col flex-grow overflow-hidden">
                <ChatPanel onSelectEditor={() => setActiveTab("editor")} />
              </TabsContent>
              <TabsContent value="editor" className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col flex-grow overflow-hidden">
                <EditorPanel />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          // デスクトップ表示: 分割パネル
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full"
          >
            <ResizablePanel 
              defaultSize={35} 
              minSize={25}
            >
              <ChatPanel />
            </ResizablePanel>
            
            <ResizableHandle withHandle className="bg-muted/50 transition-colors hover:bg-muted" />
            
            <ResizablePanel 
              defaultSize={65} 
              minSize={35}
            >
              <EditorPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
      
      {/* フッター削除 */}
    </div>
  );
}