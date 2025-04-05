"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
  Code,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HelpDialog() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="sm:max-w-4xl max-h-[92vh] md:max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 md:p-6 border-b relative">
          <DialogTitle className="flex items-center gap-2 text-primary pr-8">
            <HelpCircle className="h-5 w-5 text-primary" />
            AI編集アシスタントの使い方
          </DialogTitle>
          <DialogDescription className="pr-6">
            テキスト編集をAIがサポートします。効果的な使い方を学びましょう。
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </DialogClose>
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
          
          <ScrollArea className="h-[55vh] md:h-[60vh] py-4 px-6">
            {/* 基本的な使い方タブ */}
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

            {/* 効果的な指示出しタブ */}
            <TabsContent value="prompts" className="mt-0 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">効果的な指示出し方</h3>
                <p className="text-sm text-muted-foreground">
                  AIに効果的な編集指示を出すことで、より良い結果を得ることができます。以下のポイントを参考にしてください。
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-primary/5 rounded-lg border border-primary/20 p-3">
                  <h4 className="text-sm font-medium mb-2">指示の基本要素</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2 items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">具体的な場所の指定</span>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          「2つ目の段落を」「最初の文を」など、編集箇所を明確に指定しましょう
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">変更の目的</span>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          「わかりやすくするため」「説得力を高めるため」など、なぜ編集するのかを伝えましょう
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">望むトーンや文体</span>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          「カジュアルに」「フォーマルに」「専門的に」など、文体の方向性を指定しましょう
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">対象読者</span>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          「初心者向けに」「専門家向けに」など、読者層に応じた編集を指示しましょう
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">効果的な指示例</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted rounded-md p-2.5">
                      <p className="text-xs text-muted-foreground mb-1">👎 曖昧な指示</p>
                      <p className="text-sm">「この文章を良くしてください」</p>
                    </div>
                    <div className="bg-muted rounded-md p-2.5">
                      <p className="text-xs text-muted-foreground mb-1">👍 具体的な指示</p>
                      <p className="text-sm">「3つ目の段落をビジネス向けの客観的な文体に変更してください」</p>
                    </div>
                    <div className="bg-muted rounded-md p-2.5">
                      <p className="text-xs text-muted-foreground mb-1">👎 曖昧な指示</p>
                      <p className="text-sm">「もっと詳しく書いてください」</p>
                    </div>
                    <div className="bg-muted rounded-md p-2.5">
                      <p className="text-xs text-muted-foreground mb-1">👍 具体的な指示</p>
                      <p className="text-sm">「製品の利点についての段落に、具体的な使用例を2つ追加してください」</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">カテゴリ別の指示例</h4>
                  <div className="space-y-3">
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-secondary/30 px-3 py-1.5">
                        <h5 className="text-sm font-medium">校正・修正</h5>
                      </div>
                      <div className="p-2.5 space-y-1.5">
                        <p className="text-xs">・「文章全体の誤字脱字や文法の間違いを修正してください」</p>
                        <p className="text-xs">・「段落間の接続をよりスムーズにしてください」</p>
                        <p className="text-xs">・「文体を統一して、全体の一貫性を高めてください」</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-secondary/30 px-3 py-1.5">
                        <h5 className="text-sm font-medium">リライト・書き換え</h5>
                      </div>
                      <div className="p-2.5 space-y-1.5">
                        <p className="text-xs">・「2つ目の段落をより簡潔にまとめてください」</p>
                        <p className="text-xs">・「この説明をより専門的な表現に書き換えてください」</p>
                        <p className="text-xs">・「文章全体をよりカジュアルなトーンに変更してください」</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-secondary/30 px-3 py-1.5">
                        <h5 className="text-sm font-medium">追加・拡張</h5>
                      </div>
                      <div className="p-2.5 space-y-1.5">
                        <p className="text-xs">・「『メリット』の部分に具体例を2つ追加してください」</p>
                        <p className="text-xs">・「最後の段落に結論を追加してください」</p>
                        <p className="text-xs">・「各見出しの下に簡単な導入文を追加してください」</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 編集タイプタブ */}
            <TabsContent value="edit-types" className="mt-0 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">編集タイプについて</h3>
                <p className="text-sm text-muted-foreground">
                  AIは指示内容に応じて最適な編集タイプを自動的に選択します。以下の3つの編集タイプがあります。
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-primary/10 px-4 py-2.5 border-b">
                    <h4 className="font-medium flex items-center">
                      <span>単一の部分編集</span>
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">success</span>
                    </h4>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm">テキスト内の特定の一箇所だけを変更する編集タイプです。</p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">使用例：</p>
                      <ul className="text-xs list-disc pl-5 space-y-1">
                        <li>特定の段落をよりフォーマルに書き換える</li>
                        <li>文法ミスを修正する</li>
                        <li>特定の文章を別の表現に置き換える</li>
                      </ul>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      変更箇所を一意に特定できる場合に使用されます。一箇所のみを編集するため、確実な変更が可能です。
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-primary/10 px-4 py-2.5 border-b">
                    <h4 className="font-medium flex items-center">
                      <span>複数の部分編集</span>
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">multiple_edits</span>
                    </h4>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm">テキスト内の複数箇所を一度に変更する編集タイプです。</p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">使用例：</p>
                      <ul className="text-xs list-disc pl-5 space-y-1">
                        <li>複数の誤字脱字を一度に修正する</li>
                        <li>同じ単語を文書全体で置き換える</li>
                        <li>複数の段落にコンテンツを追加する</li>
                      </ul>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      各変更箇所が互いに重複せず、それぞれ一意に特定できる場合に使用されます。変更が多い場合でも、元の文章構造を維持できます。
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-primary/10 px-4 py-2.5 border-b">
                    <h4 className="font-medium flex items-center">
                      <span>全体置換</span>
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">replace_all</span>
                    </h4>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm">テキスト全体を新しい内容に置き換える編集タイプです。</p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">使用例：</p>
                      <ul className="text-xs list-disc pl-5 space-y-1">
                        <li>文章全体を異なる文体やトーンに書き換える</li>
                        <li>文章の大幅な拡張や再構成を行う</li>
                        <li>全体的な要約や短縮を行う</li>
                      </ul>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      部分編集では対応できない大規模な変更や、全体的な変更を指示された場合に使用されます。原文の多くを変更する際に適しています。
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden bg-muted/30">
                  <div className="px-4 py-2.5 border-b">
                    <h4 className="font-medium flex items-center">
                      <span>その他の応答状態</span>
                    </h4>
                  </div>
                  <div className="p-3 space-y-2">
                    <ul className="text-xs space-y-3">
                      <li className="flex gap-2">
                        <span className="font-medium min-w-[140px]">clarification_needed</span>
                        <span>指示が曖昧または不明確な場合に使用され、AIが詳細を質問します</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium min-w-[140px]">conversation</span>
                        <span>一般的な会話や質問に対する応答に使用されます</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium min-w-[140px]">rejected</span>
                        <span>指示が不適切または実行不可能な場合に使用されます</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium min-w-[140px]">error</span>
                        <span>システムエラーが発生した場合に使用されます</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 高度な使い方タブ */}
            <TabsContent value="advanced" className="mt-0 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">高度な使い方</h3>
                <p className="text-sm text-muted-foreground">
                  より効率的に編集作業を進めるための高度なテクニックや機能を紹介します。
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-muted/30 border rounded-lg p-3 space-y-3">
                  <h4 className="text-sm font-medium">フィードバックの活用</h4>
                  <p className="text-xs text-muted-foreground">
                    AIの編集提案に満足できない場合は、フィードバックを送ることで提案を改善できます。
                  </p>
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium">効果的なフィードバック例：</h5>
                    <ul className="text-xs space-y-2">
                      <li className="bg-primary/5 p-2 rounded-md">
                        「もう少しカジュアルなトーンにしてください。現在の文体はフォーマルすぎます。」
                      </li>
                      <li className="bg-primary/5 p-2 rounded-md">
                        「この部分はもっと詳しく説明してください。特に～の点について具体例があると良いです。」
                      </li>
                      <li className="bg-primary/5 p-2 rounded-md">
                        「変更箇所を減らして、文法の修正だけに集中してください。」
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">会話の継続性</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    AIはこれまでの会話履歴を考慮するため、複数のステップに分けて編集作業を進められます。
                  </p>
                  <div className="border rounded-md p-3 space-y-2">
                    <h5 className="text-xs font-medium">会話例：</h5>
                    <div className="space-y-2 text-xs">
                      <p className="bg-secondary/20 p-2 rounded-md">
                        <span className="font-medium">ユーザー：</span> この文章の誤字脱字を修正してください
                      </p>
                      <p className="bg-primary/10 p-2 rounded-md">
                        <span className="font-medium">AI：</span> [編集提案を提示]
                      </p>
                      <p className="bg-secondary/20 p-2 rounded-md">
                        <span className="font-medium">ユーザー：</span> ありがとう。次に、この文章をより簡潔にまとめてください
                      </p>
                      <p className="bg-primary/10 p-2 rounded-md">
                        <span className="font-medium">AI：</span> [新たな編集提案を提示]
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">直接編集機能</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    エディタパネルの編集ボタン（鉛筆アイコン）を使って、AIの提案を適用せずに直接テキストを編集することもできます。
                  </p>
                  <div className="border rounded-md p-3">
                    <p className="text-xs">
                      <span className="font-medium">使用シナリオ：</span> AIの提案の一部だけを取り入れたい場合や、細かな調整が必要な場合に便利です。編集後の内容はチャット履歴に記録され、AIはその変更を考慮して次の提案を行います。
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">複雑な指示のコツ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border rounded-md p-3 space-y-1.5">
                      <h5 className="text-xs font-medium">段階的な指示</h5>
                      <p className="text-xs text-muted-foreground">
                        複雑な編集は一度に指示するのではなく、段階的に指示すると良い結果が得られます。
                      </p>
                    </div>
                    <div className="border rounded-md p-3 space-y-1.5">
                      <h5 className="text-xs font-medium">詳細な制約の指定</h5>
                      <p className="text-xs text-muted-foreground">
                        「～を変えずに」「～の箇所だけ」など、制約条件を明確に伝えましょう。
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">プロのテクニック</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">編集パターンの活用</span>
                        <p className="text-muted-foreground mt-0.5">
                          同じ種類の文書を繰り返し編集する場合は、成功したプロンプトを再利用しましょう
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">反復的な改善</span>
                        <p className="text-muted-foreground mt-0.5">
                          大きな変更は一度に行わず、小さな変更を積み重ねて徐々に改善していくアプローチが効果的です
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">原文の特徴を説明</span>
                        <p className="text-muted-foreground mt-0.5">
                          「この文章は技術マニュアルで、簡潔さが重要です」など、原文の目的や特徴を説明すると良い結果が得られます
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="px-4 py-3 border-t">
          <DialogClose asChild>
            <Button variant="outline">閉じる</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}