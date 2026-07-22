/** 公告列表项 */
export interface Notice {
  id: number;
  title: string;
  category: string;
  publisher: string;
  publishTime: string;
  summary: string;
  isRead: boolean;
  pinned: boolean;
}

/** 公告附件 */
export interface NoticeAttachment {
  name: string;
  url: string;
}

/** 公告详情 */
export interface NoticeDetail {
  id: number;
  title: string;
  category: string;
  publisher: string;
  publishTime: string;
  content: string;
  attachments: NoticeAttachment[];
  readCount: number;
}

/** 消息类型 */
export type MessageType = 'approval' | 'task' | 'system' | 'attendance';

/** 站内消息 */
export interface Message {
  id: number;
  title: string;
  content: string;
  type: MessageType;
  isRead: boolean;
  createdAt: string;
  link: string;
}

/** 未读数量 */
export interface UnreadCount {
  notices: number;
  messages: number;
  total: number;
}

/** 全部已读结果 */
export interface ReadAllResult {
  count: number;
}
