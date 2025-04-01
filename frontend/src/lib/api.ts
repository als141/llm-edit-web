import { type AiResponse, type ConversationMessage, type MessageRole } from '@/lib/types';

// バックエンドのFirebase Functions URLを設定
// 環境変数から読み込むのが望ましい
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/your-firebase-project-id/asia-northeast1/edit'; // ローカルエミュレータ or デプロイ済みURL

interface ApiRequest {
  current_file_content: string;
  latest_user_content: string;
  history: { role: string; content: string | AiResponse }[]; // バックエンドの期待する型
  is_feedback: boolean;
  previous_proposal: AiResponse | null;
}

export async function callEditApi(requestData: ApiRequest): Promise<AiResponse> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      // エラーレスポンスの内容を試みる
      let errorData: AiResponse | null = null;
      try {
         errorData = await response.json();
      } catch (jsonError) {
         // JSONパース失敗
         console.error("Failed to parse error response:", jsonError);
      }
      throw new Error(
          errorData?.message || `API request failed with status ${response.status}`
      );
    }

    const data: AiResponse = await response.json();
    return data;

  } catch (error: any) {
    console.error('API call failed:', error);
    // エラーを一貫した AiResponse 形式で返す
    return {
      status: 'error',
      message: error.message || 'API通信中に不明なエラーが発生しました。',
    };
  }
}