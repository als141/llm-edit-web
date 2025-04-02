"use client";

import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// 編集指示のヒント例
const PROMPT_EXAMPLES = [
  {
    title: "校正・修正",
    examples: [
      "この文章の誤字脱字や文法の間違いを修正してください",
      "段落間の接続をよりスムーズにしてください",
      "文体を統一して、全体の一貫性を高めてください"
    ]
  },
  {
    title: "リライト・書き換え",
    examples: [
      "2つ目の段落をより簡潔にまとめてください",
      "この説明をより専門的な表現に書き換えてください",
      "文章全体をよりカジュアルなトーンに変更してください"
    ]
  },
  {
    title: "追加・拡張",
    examples: [
      "「メリット」の部分に具体例を2つ追加してください",
      "最後の段落に結論を追加してください",
      "各見出しの下に簡単な導入文を追加してください"
    ]
  },
  {
    title: "削減・要約",
    examples: [
      "この長い説明を3行程度に要約してください",
      "重複している内容を削除して文章を短くしてください",
      "この段落から最も重要な情報だけを抽出してください"
    ]
  },
  {
    title: "構造化・整理",
    examples: [
      "文章を見出しを使って構造化してください",
      "関連する内容ごとに段落を整理してください",
      "この情報を箇条書きリストに変換してください"
    ]
  }
];

export function EditPromptHints() {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState(0);
  // レスポンシブ対応
  useEffect(() => {
    const checkScreenSize = () => {
      // 直接レスポンシブ処理を行い、状態としては持たない
      // ここでは何もしないが、将来的に必要になった場合に再実装する
    };
    
    // 初期チェック
    checkScreenSize();
    
    // リサイズイベントリスナー
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // 5秒ごとにカテゴリを自動で切り替え
  useEffect(() => {
    if (!expanded) {
      const interval = setInterval(() => {
        setCategory((prev) => (prev + 1) % PROMPT_EXAMPLES.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [expanded]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("クリップボードにコピーしました", { duration: 2000 });
    });
  };

  return (
    <div className={cn(
      "w-full bg-card border rounded-lg overflow-hidden transition-all duration-300 shadow-sm",
      expanded ? "mb-4" : "mb-2" 
    )}>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">編集指示のヒント</span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded ? (
        <div className="px-3 pb-3 space-y-3">
          <div className="flex gap-1 flex-wrap">
            {PROMPT_EXAMPLES.map((item, index) => (
              <Button
                key={index}
                variant={category === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(index)}
                className={cn(
                  "text-xs h-7",
                  category === index ? "bg-primary text-primary-foreground" : ""
                )}
              >
                {item.title}
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            {PROMPT_EXAMPLES[category].examples.map((example, i) => (
              <div 
                key={i}
                className="flex items-start justify-between gap-2 bg-muted/50 rounded-md p-2 group"
              >
                <p className="text-xs text-muted-foreground">{example}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(example)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="sr-only">コピー</span>
                </Button>
              </div>
            ))}
          </div>
          
          <div className="bg-primary/5 rounded-md p-2 border border-primary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              効果的な指示には、<span className="font-medium text-foreground">具体的な場所の指定</span>、
              <span className="font-medium text-foreground">変更の目的</span>、
              <span className="font-medium text-foreground">望むトーンや文体</span>などを含めると良いでしょう。
              必要に応じて<span className="font-medium text-foreground">対象読者</span>についても言及してください。
            </p>
          </div>
        </div>
      ) : (
        <div className="px-3 pb-3">
          <p className="text-xs text-muted-foreground italic">
            {PROMPT_EXAMPLES[category].examples[0]}
          </p>
        </div>
      )}
    </div>
  );
}