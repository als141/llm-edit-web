// frontend/src/lib/types.ts

// 応答のステータスを示す型
export type AiStatus = 'success' | 'multiple_edits' | 'replace_all' | 'clarification_needed' | 'conversation' | 'rejected' | 'error';

// 編集操作の型 (multiple_editsで使用)
export interface Edit {
  old_string: string;
  new_string: string;
}

// AIからの応答全体の型
export interface AiResponse {
  status: AiStatus;
  // statusに応じて以下のフィールドを持つ
  old_string?: string;   // for success
  new_string?: string;   // for success
  edits?: Edit[];        // for multiple_edits
  content?: string;      // for replace_all
  message?: string;      // for clarification_needed, conversation, rejected, error
}

// メッセージの役割
export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system', // 適用結果などのシステムメッセージ用
}

// メッセージの種類（UI表示用）
export enum MessageType {
  Normal = 'normal',
  Proposal = 'proposal', // 編集提案を含むメッセージ
  Loading = 'loading',
  Error = 'error',
  SystemInfo = 'system_info', // 適用/拒否などの情報
}

// 会話履歴の各メッセージの型
export interface ConversationMessage {
  id: string; // Reactのkey用
  role: MessageRole;
  content: string | AiResponse; // AI応答はJSONオブジェクトの場合も
  type: MessageType;
}

// APIリクエストの型
export interface ApiRequest {
  current_file_content: string;
  latest_user_content: string;
  // APIにはシンプルなrole/contentのペアを渡す想定
  history: { role: string; content: string }[];
  is_feedback: boolean;
  previous_proposal: AiResponse | null;
}