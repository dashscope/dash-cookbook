import { IChatNode, IChatNodeItem, INodeType } from '@/types/serivce';
import { v4 as uuidv4 } from 'uuid';

const createNode = (type: INodeType, node?: IChatNodeItem): IChatNode => {
  if (node) {
    return {
      type,
      order: 1,
      msgId: node.msgId,
      parentMsgId: node.parentMsgId,
      content: {
        type: node.contentType,
        value: node.content,
        error: node.error,
      },
      interrupted: node.interrupted || false,
      children: [],
      parent: null,
      likeType: node.feedback,
      msgStatus: node.msgStatus,
      // 生成中且未打断视为进行态
      flushing: node.msgStatus === 'generated' && !node.interrupted,
    };
  }
  return {
    type,
    order: 1,
    msgId: uuidv4().replace(/-/g, ''),
    parentMsgId: '',
    content: {
      type: 'text',
      value: '',
    },
    interrupted: false,
    children: [],
    parent: null,
    likeType: '',
  };
};

const MSG_TYPE = {
  BOT: 'a',
  USER: 'q',
};

class ChatStore {
  private root: IChatNode;
  private treeIndex: Record<string, IChatNode>;
  latestNode?: IChatNode | null;

  constructor() {
    this.root = createNode('root');
    this.root.msgId = '0';
    this.treeIndex = {};
    this.latestNode = this.root;
  }

  getAllList() {
    if (!this.latestNode) return [];
    return this.getPathList(this.latestNode) || [];
  }

  getTotalCount() {
    return Object.keys(this.treeIndex).length;
  }

  getPathList(node: IChatNode) {
    let point = node;
    let paths: IChatNode[] = [];
    while (['a', 'q'].includes(point?.type)) {
      paths.unshift(point);
      point = this.treeIndex[point.parentMsgId];
    }
    return paths;
  }

  updateHistoryList(list: IChatNodeItem[]) {
    this.treeIndex = {};
    this.root = createNode('root');
    this.root.msgId = '0';
    let latestNode = { createTime: 0, msgId: '0' } as any;
    list.forEach((item) => {
      if (item.createTime > latestNode.createTime) latestNode = item;
      this.treeIndex[item.msgId] = createNode(MSG_TYPE[item.senderType], item);
    });
    list.forEach((item) => {
      const parentNode = this.treeIndex[item.parentMsgId]
        ? this.treeIndex[item.parentMsgId]
        : this.root;
      this.treeIndex[item.msgId].parent = parentNode;
      this.treeIndex[item.msgId].order = parentNode.children.length + 1;
      parentNode.children.push(this.treeIndex[item.msgId]);
    });
    this.latestNode = this.treeIndex[latestNode.msgId];
  }

  private addNode(parent?: IChatNode | null, node?: IChatNode) {
    if (!parent || !node) return;
    node.order = parent.children.length + 1;
    parent.children.push(node);
    node.parent = parent;
    node.parentMsgId = parent.msgId;
    this.treeIndex[node.msgId] = node;
  }

  updateTreeIndex({ oldId, newId, chatNode }) {
    if (this.treeIndex[newId]) return;
    chatNode.msgId = newId;
    this.treeIndex[newId] = chatNode;
    delete this.treeIndex[oldId];
  }

  /**
   * 更新具体节点
   * @param {string} msgId
   * @param {IChatNode} node
   * @memberof ChatStore
   */
  updateNode(msgId: string, node: IChatNodeItem) {
    const oldNode = this.treeIndex[msgId];
    const cNode = {
      ...oldNode,
      msgStatus:node.msgStatus,
      flushing: node.msgStatus === 'generated' && !node.interrupted,
      content: {
        type: node.contentType,
        value: node.content,
      },
    };
    if (this.latestNode?.msgId === msgId) {
      this.latestNode = cNode;
    }
    this.treeIndex[msgId] = cNode;
  }

  setLatestNode(node: IChatNode | null) {
    this.latestNode = node;
  }

  addQuestion(value) {
    const questionNode = createNode('q');
    questionNode.content = {
      type: 'text',
      value,
    };
    this.addNode(this.latestNode, questionNode);
    this.setLatestNode(questionNode);
    return questionNode;
  }

  errorAnswer(e) {
    if (!this.latestNode) return;
    this.latestNode.content.error = e;
    this.latestNode.flushing = false;
  }

  addAnswer() {
    const answerNode = createNode('a');
    answerNode.flushing = true;
    answerNode.content = {
      type: 'text',
      value: '',
    };
    this.addNode(this.latestNode, answerNode);
    this.setLatestNode(answerNode);
    return answerNode;
  }

  finishAnswer(node: IChatNode) {
    node.flushing = false;
  }

  regenerateLatest() {
    if (!this.latestNode) return;
    this.setLatestNode(this.latestNode?.parent);
    return this.latestNode;
  }

  modifyNodeGenerate(nodeId: string, value: string) {
    const node = this.treeIndex[nodeId];
    this.setLatestNode(node.parent);
    return this.addQuestion(value);
  }

  findNode(nodeId: string) {
    return this.treeIndex[nodeId];
  }

  getPrevNode(nodeId: string, order: number) {
    if (!order) return;
    const node = this.treeIndex[nodeId].parent;
    if (!node?.children?.[order - 1]) return;
    return node.children[order - 1];
  }

  switchNode(nodeId: string, index: number) {
    const node = this.treeIndex[nodeId].parent;
    if (!(node && node.children[index])) {
      throw new Error('节点序号有误');
    }
    let point: IChatNode = node.children[index];
    while (point.children.length) {
      point = point.children[0];
    }
    this.setLatestNode(point);
  }

  init(json) {
    const initChild = (parent: IChatNode, children: any) => {
      children.forEach((el) => {
        const cur = createNode(el.type);
        cur.msgId = el.msgId;
        cur.content = el.content;
        console.log('init');
        this.setLatestNode(cur);
        this.addNode(parent, cur);
        initChild(cur, el.children);
      });
    };

    initChild(this.root, json);
  }
}

export { INodeType };
export default ChatStore;
