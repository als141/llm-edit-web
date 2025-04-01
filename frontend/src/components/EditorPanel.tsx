"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileInput } from "@/components/FileInput";
import { useEditorStore } from "@/store/editorStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, FileText, Type } from "lucide-react";

export function EditorPanel() {
  const currentText = useEditorStore(state => state.currentText);
  const fileContent = useEditorStore(state => state.fileContent);

  return (
    <Card className="flex flex-col h-full rounded-none border-none shadow-none">
      <CardHeader className="px-4 pb-0 pt-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          テキストエディタ
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col h-full p-4 pt-2">
        <Tabs defaultValue="editor" className="flex flex-col h-full">
          <TabsList className="mb-2 self-start">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>エディタ</span>
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <CodeIcon className="h-4 w-4" />
              <span>Raw</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-grow flex flex-col space-y-4 overflow-hidden mt-0">
            <FileInput />
            
            <Card className="flex-grow flex flex-col shadow-sm">
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>現在のテキスト</span>
                  <span className="text-xs text-muted-foreground">
                    {currentText.length > 0 ? `${currentText.length.toLocaleString()} 文字` : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-0 overflow-hidden">
                <ScrollArea className="h-full">
                  {fileContent === '' ? (
                    <div className="text-muted-foreground h-full flex flex-col items-center justify-center p-8">
                      <FileText className="h-12 w-12 mb-4 text-muted-foreground/25" />
                      <p className="text-center max-w-md">
                        テキストを入力またはファイルをアップロードしてください。
                        AIが編集の手助けをします。
                      </p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <pre className="text-sm whitespace-pre-wrap break-words font-mono bg-muted/30 p-4 rounded-md">
                        {currentText}
                      </pre>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="raw" className="flex-grow flex flex-col overflow-hidden space-y-4 mt-0">
            <Card className="flex-grow shadow-sm">
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-full">
                  {fileContent === '' ? (
                    <div className="text-muted-foreground h-full flex flex-col items-center justify-center p-8">
                      <CodeIcon className="h-12 w-12 mb-4 text-muted-foreground/25" />
                      <p className="text-center">テキストが入力されていません</p>
                    </div>
                  ) : (
                    <pre className="p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                      {currentText}
                    </pre>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}