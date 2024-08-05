export type INodeType = 'q' | 'a' | 'root';
export interface ISessionItem {
  sessionId: string;
  /* 摘要 */
  summary: string;
  /* 首问 */
  firstQuery: string;
}

export interface IChatNodeItem {
  content: string;
  msgId: string;
  parentMsgId: string;
  senderType: string;
  error?: any;
  createTime: number;
  interrupted: boolean;
  contentType: string;
  msgStatus?: string;
  feedback: 'thumbsDown' | 'thumbsUp';
}

export interface IChatNode {
  order: number;
  type: INodeType;
  msgId: string;
  parentMsgId: string;
  content: {
    type: string;
    value: string;
    error?: any;
  };
  children: IChatNode[];
  parent: IChatNode | null;
  likeType: string;
  flushing?: boolean;
  interrupted?: boolean;
  msgStatus?: string;
  contentType?: string;
}
export interface IMessage {
  sessionId: string;
  requestId: string;
  parentMsgId: string;
  content: string;
}
