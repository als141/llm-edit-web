"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  HelpCircle, 
  MessageSquare, 
  FileEdit, 
  SplitSquareVertical, 
  Check, 
  Code
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="outline" 
            className="h-8 px-3 border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary-foreground hover:border-primary shadow-sm flex items-center gap-1.5"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="text-xs font-medium">使い方</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 md:p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-primary">
            <HelpCircle className="h-5 w-5 text-primary" />
            AI編集アシスタントの使い方
          </DialogTitle>
          <DialogDescription>
            テキスト編集をAIがサポートします。効果的な使い方を学びましょう。
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b px-4">
            <TabsTrigger value="basic" className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>基本的な使い方</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-1.5">
              <FileEdit className="h-3.5 w-3.5" />
              <span>効果的な指示出し</span>
            </TabsTrigger>
            <TabsTrigger value="edit-types" className="flex items-center gap-1.5">
              <SplitSquareVertical className="h-3.5 w-3.5" />
              <span>編集タイプ</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5" />
              <span>高度な使い方</span>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[60vh] py-4 px-6">
            {/* 既存のTabsContentは変更なし */}
            <TabsContent value="basic" className="mt-0 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">基本的な使い方</h3>
                <ol className="space-y-4 list-decimal pl-5">
                  <li>
                    <span className="font-medium">テキストを用意する</span>
                    <p className="text-sm text-muted-foreground mt-1">「テキストを入力またはファイルを選択」からテキストをアップロードまたは直接入力します。</p>
                  </li>
                  <li>
                    <span className="font-medium">AIに編集指示を出す</span>
                    <p className="text-sm text-muted-foreground mt-1">チャットパネルに具体的な編集指示を入力します（例：「最初の段落を簡潔にしてください」）。</p>
                  </li>
                  <li>
                    <span className="font-medium">編集提案を確認する</span>
                    <p className="text-sm text-muted-foreground mt-1">AIが提案した編集内容を確認します。</p>
                  </li>
                  <li>
                    <span className="font-medium">提案を適用または拒否する</span>
                    <p className="text-sm text-muted-foreground mt-1">「適用」ボタンをクリックして変更を受け入れるか、「拒否」ボタンで却下します。</p>
                  </li>
                  <li>
                    <span className="font-medium">フィードバックを送る（オプション）</span>
                    <p className="text-sm text-muted-foreground mt-1">「フィードバック」ボタンをクリックして編集提案に対する要望を伝えることができます。</p>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-2 pt-2">
                <h3 className="text-lg font-medium">できること</h3>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">文章のリライト</span>
                      <p className="text-sm text-muted-foreground mt-0.5">文章の表現や文体を改善します</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">文法・誤字の修正</span>
                      <p className="text-sm text-muted-foreground mt-0.5">文法ミスや誤字脱字を見つけて修正します</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">文章の追加・拡張</span>
                      <p className="text-sm text-muted-foreground mt-0.5">コンテンツを追加したり、詳細を展開したりします</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">文章の要約・短縮</span>
                      <p className="text-sm text-muted-foreground mt-0.5">文章を簡潔にまとめたり、冗長な部分を削減します</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">文体・トーンの変更</span>
                      <p className="text-sm text-muted-foreground mt-0.5">フォーマル/カジュアル、専門的/一般向けなど文体を変換します</p>
                    </div>
                  </li>
                </ul>
              </div>
            </TabsContent>

            {/* その他のタブコンテンツは省略 */}
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="px-4 py-3 border-t">
          <Button variant="outline">閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}