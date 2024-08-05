const reg = /^[A-Za-z]+$/;

let timeout;
const sleep = (ms) => {
  clearTimeout(timeout);
  return new Promise((resolve) => {
    timeout = setTimeout(resolve, ms);
  });
};

function isNeedJumpTag(
  whiteTags: { tag: string; closeTag: string }[] = [],
  str = '',
  cursor = 0,
) {
  for (let i = 0; i < whiteTags.length; i++) {
    const tagFlag = whiteTags[i];
    const tag = str.slice(cursor, cursor + tagFlag.tag.length);
    const closeTag = str.slice(cursor, cursor + tagFlag.closeTag.length);
    if (tag === tagFlag.tag) return true;
    if (closeTag === tagFlag.closeTag) return false;
  }
  return undefined;
}

const batchToStream = (cbk, end = () => {}) => {
  let queue = '';
  let flushing = true;
  let cursor = 0;
  let pause = false;
  let goOn = false;
  const reset = () => {
    queue = '';
    cursor = 0;
    flushing = false;
    clearTimeout(timeout);
  };
  const run = () => {
    if (pause) {
      reset();
      return;
    }

    if (cursor <= queue.length) {
      ++cursor;
    }
    const word = queue.charAt(cursor);
    if (word === '<') {
      const flag = isNeedJumpTag(
        [{ tag: '<!-- fast -->', closeTag: '<!-- slow -->' }],
        queue,
        cursor,
      );
      if (flag !== undefined) goOn = flag;
    }
    if (goOn && cursor > queue.length) {
      cbk(queue);
      sleep(40).then(() => run());
      return;
    }
    if (reg.test(word) || goOn) {
      run();
      return;
    }

    cbk(queue.slice(0, cursor));

    if (cursor <= queue.length || flushing) {
      // requestAnimationFrame(run);
      sleep(40).then(() => run());
    } else {
      end();
    }
  };

  return (input, flush, pauseStatus = false) => {
    pause = pauseStatus;
    if (pause) {
      reset();
      return;
    }
    if (input) {
      queue = input;
    }
    flushing = flush;
    if (cursor === 0) {
      run();
    }
  };
};

export const isPre = window.env === 'aliyun-pre';

export const randomList = (list: any[] = [], newLen = 0) => {
  const selectedItems: any[] = [];
  for (let i = 0; i < newLen; i++) {
    const randomIndex = Math.floor(Math.random() * list.length);
    const selectedItem = list.splice(randomIndex, 1)[0];
    selectedItems.push(selectedItem);
  }
  return selectedItems;
};

export { batchToStream };
