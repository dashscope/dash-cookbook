import EventEmitter from 'eventemitter3';
import json5 from 'json5';
import store from '@/store';
import { stopGeneration } from '@/services';
import { IChatNode, IChatNodeItem } from '@/types/serivce';
import ChatStore, { INodeType } from './chatStore';
import rpc from './rpc';
import { batchToStream } from './utils';

interface IChatOpts {
  conversation_id?: string;
}

interface IChatListItemData {
  type: INodeType; // question/answer
  flushing?: boolean; // 正在流式输出中
  id: string;
  index: number; // 所处序号
  likeType?: string;
  peerCount: number; // 当前节点的兄弟节点数量
  brotherNodes: {
    label: string;
    value: number;
  }[];
  content: {
    type: 'text';
    value: string;
    error?: any;
  };
}

interface IReceiveMessage {
  success: boolean;
  errorCode: string;
  errorMsg: string;
  error?: any;
  msgId: string;
  data: {
    content: string;
    contentType: string;
    sessionId: string;
  }
  msgStatus?: string;
}

const TIMEOUT = 120;

class Chat extends EventEmitter {
  conversation_id: string;
  store: ChatStore;
  countTime: number;
  timer: any; // 定时器
  logTimer: any;
  logCountTime: any;
  batchHandler: (
    val: string,
    flushing?: boolean,
    pause?: boolean,
    immediately?: boolean,
  ) => void;

  constructor(opts: IChatOpts) {
    super();
    this.conversation_id = opts.conversation_id || ''; // 第一次返回时填写
    this.store = new ChatStore();
    this.countTime = 0;
    this.logCountTime = 0;
    this.logTimer = null;
    this.timer = null;
  }

  /**
   * 更新sessionId
   * @param {string} value
   * @memberof Chat
   */
  updateConversationId(value: string) {
    this.conversation_id = value;
    this.store = new ChatStore();
    clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * @param {IChatNodeItem[]} [list=[]]
   * @memberof Chat
   */
  updateChatList(list: IChatNodeItem[] = []) {
    this.store.updateHistoryList(list);
    this.updateList();
  }

  /**
   *
   * 停止生成
   * @param {*} targetItem
   * @memberof Chat
   */
  stopGenerate(targetItem: any) {
    if (this.store.latestNode) {
      this.store.latestNode.interrupted = true;

      this.store.latestNode.content.value = targetItem.content;
      this.messageFlushingEnd(this.store.latestNode, true);
    }
    this.close();
    targetItem.requestId = targetItem.msgId;
    console.log(targetItem, '>>>ss');
    stopGeneration({
      ...targetItem,
      sessionId: this.conversation_id,
    }).then((res) => {
      console.log(res, '>>> stop generate error');
    });
  }

  /**
   *
   * 常规输入文本生成
   * @param {string} value
   * @param {*} config
   * @param contentType
   * @memberof Chat
   */
  normalGenerate(value: string, config: any = {}) {
    const question = this.store.addQuestion(value);
    const app = store.getModelDispatchers('app');
    const appState = store.getState().app;
    this.updateList();
    this.sendMessage(
      {
        action: 'next',
        requestId: question.msgId,
        parentMsgId: question.parentMsgId,
        content: value,
        timeout: TIMEOUT,
        sessionType: config.sessionType,
        code: appState.sessionCode,
        userId: appState.userId,
        ...config,
        dataId: config.dataId,
      }
    );
    app.update({ source: null });
  }

  /**
   * 重新生成
   * @return {*}
   * @memberof Chat
   */
  reGenerate() {
    const question = this.store.regenerateLatest();
    if (!question) return;
    this.updateList();
    this.sendMessage(
      {
        action: 'next',
        requestId: question.msgId,
        parentMsgId: question.parentMsgId,
        content: question.content.value,
        timeout: TIMEOUT,
      }
    );
  }

  /**
   *
   * 修改 query 生成
   * @param {string} nodeId
   * @param {string} value
   * @param contentType
   * @memberof Chat
   */
  modifyGenerate(nodeId: string, value: string) {
    const question = this.store.modifyNodeGenerate(nodeId, value);
    this.sendMessage(
      {
        action: 'next',
        requestId: question.msgId,
        content: value,
        parentMsgId: question.parentMsgId,
        timeout: TIMEOUT,
      }
    );
    this.updateList();
  }

  /**
   *
   * @param {string} nodeId
   * @param {number} index
   * @memberof Chat
   */
  switchNode(nodeId: string, index: number) {
    this.store.switchNode(nodeId, index);
    this.updateList();
  }

  /**
   * 立即推送
   * @private
   * @param {IChatNode} node
   * @memberof Chat
   */
  private immediatelyMsgPush = (node: IChatNode) => {
    const { value } = node.content;
    // 防止推送时组件还未挂载
    setTimeout(() => {
      this.emit('flush', value);
      setTimeout(() => {
        if (node.msgStatus === 'finished') {
          this.updateList();
          // 结束loading态
          this.emit('flushEnd');
          this.store.finishAnswer(node);
        }
      }, 30);
    }, 60);
  };
  /**
   * 结束流式输出
   * @private
   * @param {IChatNode} targetNode
   * @param {boolean} [pause=false]
   * @memberof Chat
   */
  private messageFlushingEnd = (targetNode: IChatNode, pause = false) => {
    const { value } = targetNode.content;
    this.emit('flushEnd');
    this.store.finishAnswer(targetNode);
    this.batchHandler?.(value, false, pause);
    this.updateList();
  };

  /**
   * 推送消息
   * @private
   * @param {IChatNode} node
   * @param {boolean} [flushing]
   * @memberof Chat
   */
  private pushMsg = (node: IChatNode, flushing?: boolean) => {
    const { value, type } = node.content;
    if (type === 'text2image') {
      this.immediatelyMsgPush(node);
    } else {
      this.batchHandler(value, flushing);
    }
  };

  /**
   * 结束长连接
   * @memberof Chat
   */
  close() {
    rpc.control?.abort();
    clearInterval(this.timer);
  }

  /**
   * 建立回话
   * 发送生成的消息
   * @private
   * @param {*} params
   * @memberof Chat
   */
  private sendMessage(params) {
    clearInterval(this.timer);
    clearInterval(this.logTimer);

    // 获取answer初始配置
    const answer: IChatNode = this.store.addAnswer();
    this.updateList();

    // 打字机效果输出(注意闭包变量)
    this.batchHandler = batchToStream(
      (text: string) => this.emit('flush', text),
      () => this.messageFlushingEnd(answer),
    );

    this.logTimer = setInterval(() => {
      this.logCountTime++;
      if (this.logCountTime === 5) {
        clearInterval(this.logTimer);
      }
    }, 1000);

    rpc.conversation(
      {
        ...params,
        sessionId: this.conversation_id,
      },
      {
        onopen: (res) => {
          this.timer = setInterval(() => {
            this.countTime++;
            if (this.countTime === params.timeout) {
              clearInterval(this.timer);
              rpc.control?.abort();
              this.countTime = 0;
              const _obj = {
                errorMsg: '啊哦，我刚开小差了，请点击“重新生成”按钮，再试一试',
                errorCode: '',
              };
              this.store.errorAnswer(_obj);
              this.messageFlushingEnd(answer);
              this.emit('flushEnd');
            }
          }, 1000);
        },
        onmessage: (event) => {
          clearInterval(this.timer);
          clearInterval(this.logTimer);
          const data = event.data;
          let parsed: IReceiveMessage;
          try {
            parsed = json5.parse(data);
          } catch (e) {
            console.error(e, event.data);
            return;
          }
          if (
            ['ChatCountMax', 'QuerySecurityMax'].includes(
              parsed.error?.errorCode,
            )
          ) {
            this.emit('sessionEnd', {
              sessionId: this.conversation_id,
              errorCode: parsed.error.errorCode,
            });
          }

          if (parsed.success) {
            this.conversation_id = parsed.data.sessionId;
            answer.content.value += parsed.data.content;
            answer.content.type = parsed.data.contentType;
            answer.msgStatus = parsed.msgStatus;
            this.pushMsg(answer, answer.flushing || true);
          } else {
            // 有错误时emit flushEnd 消息重新聚焦输入框
            // this.store.errorAnswer(parsed.error);
            answer.content.value = 'Request error, reason: ' + parsed.errorMsg;
            this.pushMsg(answer, true);
            this.messageFlushingEnd(answer);
          }
        },
        onclose: () => {
          clearInterval(this.timer);
          clearInterval(this.logTimer);
          this.store.finishAnswer(answer);
          this.pushMsg(answer, false);
          this.emit('close');
        },
        onerror: (err) => {
          clearInterval(this.timer);
          clearInterval(this.logTimer);
          this.store.errorAnswer(err);
        },
      },
    );
  }

  /**
   * 返回对话列表
   * @private
   * @return {*}
   * @memberof Chat
   */
  private getList() {
    return this.store.getAllList();
  }

  /**
   * 更新节点信息
   * @param {string} msgId
   * @param {IChatNodeItem} node
   * @memberof Chat
   */
  public updateMsg(msgId: string, node: IChatNodeItem) {
    this.store.updateNode(msgId, node);
    this.updateList();
    this.emit('modifyValue', node);
  }

  /**
   * 刷新页面对话列表
   * @private
   * @memberof Chat
   */
  private updateList() {
    const _list = this.getList();
    const list: any[] = _list.map((el) => {
      const { parent, children, ...others } = el;
      return {
        ...others,
        peerCount: parent?.children.length,
        parentMsgId: parent?.msgId,
      };
    });
    this.emit('updateList', list);
  }
}

export { IChatListItemData };
export default Chat;
