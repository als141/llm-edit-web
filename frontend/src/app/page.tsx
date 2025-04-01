"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ChatPanel } from "@/components/ChatPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { useEditorStore } from "@/store/editorStore";
import { useEffect } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ModeToggle";

export default function Home() {
  const error = useEditorStore((state) => state.error);
  const clearError = useEditorStore((state) => state.clearError);

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
    <main className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ヘッダーバーを追加 */}
      <header className="flex items-center justify-between border-b px-6 py-3 bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI Text Editor</h1>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div className="flex-grow overflow-hidden p-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full rounded-lg"
        >
          <ResizablePanel 
            defaultSize={35} 
            minSize={25} 
            className="transition-all duration-200 ease-in-out"
          >
            <ChatPanel />
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-muted/50 transition-colors hover:bg-muted" />
          
          <ResizablePanel 
            defaultSize={65} 
            minSize={35} 
            className="transition-all duration-200 ease-in-out"
          >
            <EditorPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* フッターを追加 */}
      <footer className="border-t py-2 px-6 text-center text-sm text-muted-foreground bg-card/50">
        <p>AI Text Editor &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}