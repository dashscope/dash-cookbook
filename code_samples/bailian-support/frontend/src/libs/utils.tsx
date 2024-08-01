import { getDataId, getUploadFileToken } from '@/services';
import store from '@/store';

export const ERROR_IMG =
  'https://img.alicdn.com/imgextra/i1/O1CN01pX8NaC1cK98xD45BO_!!6000000003581-2-tps-640-480.png';

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

export const onMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

export const isAndroid = /(?:Android)/.test(navigator.userAgent);
export const isFireFox = /(?:Firefox)/.test(navigator.userAgent);
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export const isDingTalk = /DingTalk/i.test(navigator.userAgent);

export const uploadFile = async ({
  file,
  fileType,
  onProgress,
  abortSignal,
}: {
  file: any;
  fileType?: string;
  onProgress?: (v: any) => {};
  abortSignal?;
}) => {
  const appState = store.getState().app;
  const { data: token } = await getUploadFileToken({ fileName: file.name, userId: appState.userId });
  const xhr = new XMLHttpRequest();
  if (!token) return;
  const { accessId, host, policy, signature, dir, key, securityToken, expire } = token as any;
  return new Promise((resolve, reject) => {
    const bodyFormData = new FormData();
    bodyFormData.append('OSSAccessKeyId', accessId);
    bodyFormData.append('policy', policy);
    bodyFormData.append('signature', signature);
    bodyFormData.append("x-oss-security-token", securityToken);
    bodyFormData.append("expires", expire);
    bodyFormData.append('key', key);
    bodyFormData.append('dir', dir);
    bodyFormData.append('success_action_status', '200');
    bodyFormData.append('Content-Disposition', 'attachment');
    bodyFormData.append('file', file);
    if (xhr) {
      xhr.abort();
    }
    if (abortSignal) {
      abortSignal.onabort = () => {
        xhr.abort();
      };
    }
    xhr.onerror = function error(e) {
      console.log('upload error', e);
      reject(e);
    };
    xhr.onload = async () => {
      // allow success when 2xx status see https://github.com/react-component/upload/issues/34
      if (xhr.status < 200 || xhr.status >= 300) {
        reject('上传异常');
      }

      try {
        const res = await getDataId({
          fileName: file.name,
          ossPath: key,
          userId: appState.userId,
        })
        resolve({ dataId: res.data.dataId });
      } catch (e) {
        reject(e);
      }
    };
    xhr.upload.onprogress = (event) => {
      const val = event.loaded / event.total;
      onProgress && onProgress(val);
    };
    xhr.open('post', host, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send(bodyFormData);
  });
};

export function getURLFileExtension(url) {
  let extension = url.split('.').pop();
  extension = extension?.split('?').shift();
  if (extension.includes('/')) {
    let components = extension.split('/');
    extension = components[0];
  }
  return extension;
}

export const insertMeta = (metaName, metaContent) => {
  const meta = document.createElement('meta');
  meta.name = metaName;
  meta.content = metaContent;
  document.getElementsByTagName('head')[0].appendChild(meta);
};

export const softKeyboardFit = () => {
  if (!onMobile || isAndroid) return;
  const originalHeight =
    document.documentElement.clientHeight || document.body.clientHeight;
  if (originalHeight || !isNaN(originalHeight)) {
    window.onresize = () => {
      return (() => {
        // 键盘弹起与隐藏都会引起窗口的高度发生变化
        if (isAndroid) {
          const resizeHeight =
            document.documentElement.clientHeight || document.body.clientHeight;
          if (resizeHeight - 0 < originalHeight - 0) {
            // 当软键盘弹起，在此处操作
            document
              .querySelector('body')
              ?.setAttribute('style', `height:${originalHeight}px;`);
          } else {
            // 当软键盘收起，在此处操作
            document
              .querySelector('body')
              ?.setAttribute('style', 'height:100%;');
          }
        }

        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          window.setTimeout(() => {
            if (
              document.activeElement &&
              'scrollIntoView' in document.activeElement
            ) {
              document.activeElement.scrollIntoView(false);
              if (!isAndroid) {
                document.body.scrollTop = document.body.scrollHeight;
              }
            } else {
              // @ts-ignore
              document.activeElement?.scrollIntoViewIfNeeded(false);
            }
          }, 300);
        }
      })();
    };
  }
};

export const breakLine = (
  textArea: HTMLTextAreaElement,
  setTextValue: (val: string) => void,
) => {
  if (!textArea) return;
  const { selectionStart, selectionEnd, value } = textArea;
  const left = value.slice(0, selectionStart);
  const right = value.slice(selectionEnd);
  setTextValue(`${left}\n${right}`);
};

export const copyText = function (
  button,
  content = () => {},
  success = () => {},
) {
  if (!button) {
    return;
  }

  if (typeof content === 'function') {
    success = content;
    content = null;
  }

  success = success || function () {};

  // 是否降级使用
  let isFallback = !navigator.clipboard;

  if (typeof button === 'string' && !content) {
    if (content === false) {
      isFallback = true;
    }
    content = button;
    button = null;
  }

  let eleTextarea = document.querySelector('#tempTextarea');
  if (!eleTextarea && isFallback) {
    eleTextarea = document.createElement('textarea');
    eleTextarea.style.width = 0;
    eleTextarea.style.position = 'fixed';
    eleTextarea.style.left = '-999px';
    eleTextarea.style.top = '10px';
    eleTextarea.setAttribute('readonly', 'readonly');
    document.body.appendChild(eleTextarea);
  }

  let funCopy = function (text, callback) {
    callback = callback || function () {};

    if (!isFallback) {
      navigator.clipboard.writeText(text).then(
        () => {
          callback();
          // 成功回调
          success(text);
        },
        () => {
          // 禁止写入剪切板后使用兜底方法
          copyText(text, false);
          callback();
          // 成功回调
          success(text);
        },
      );

      return;
    }

    eleTextarea.value = text;
    eleTextarea.select();
    document.execCommand('copy', true);

    callback();
    // 成功回调
    success(text);
  };

  if (!button) {
    funCopy(content);
    return;
  }

  // 事件绑定
  button.addEventListener('click', (event) => {
    let strCopy = content;
    if (content && content.tagName) {
      strCopy = content.textContent || content.value;
    }
    // 复制的文字内容
    if (!strCopy) {
      return;
    }

    funCopy(strCopy, () => {
      // 复制成功提示
      let eleTips = document.createElement('span');
      eleTips.className = 'text-popup';
      eleTips.innerHTML = '复制成功';
      document.body.appendChild(eleTips);
      // 事件
      eleTips.addEventListener('animationend', () => {
        eleTips.parentNode.removeChild(eleTips);
      });
      // For IE9
      if (!history.pushState) {
        setTimeout(() => {
          eleTips.parentNode.removeChild(eleTips);
        }, 1000);
      }
      eleTips.style.left = `${event.pageX - eleTips.clientWidth / 2}px`;
      eleTips.style.top = `${event.pageY - eleTips.clientHeight}px`;
    });
  });

  let strStyle =
    '.text-popup { animation: textPopup 1s both; -ms-transform: translateY(-20px); color: #01cf97; user-select: none; white-space: nowrap; position: absolute; z-index: 99; }@keyframes textPopup {0%, 100% { opacity: 0; } 5% { opacity: 1; } 100% { transform: translateY(-50px); }}';

  let eleStyle = document.querySelector('#popupStyle');
  if (!eleStyle) {
    eleStyle = document.createElement('style');
    eleStyle.id = 'popupStyle';
    eleStyle.innerHTML = strStyle;
    document.head.appendChild(eleStyle);
  }
};

export const scorllToEnd = () => {
  const dom = document.getElementById('pageFooter');
  if (!dom) return;
  setTimeout(
    () => {
      dom.scrollIntoView();
    },
    isAndroid ? 30 : 200,
  );
};

export const copy = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    // 隐藏此输入框
    textarea.style.position = 'fixed';
    textarea.style.clip = 'rect(0 0 0 0)';
    textarea.style.top = '10px';
    // 赋值
    textarea.value = text;
    // 选中
    textarea.select();
    // 复制
    document.execCommand('copy', true);
    // 移除输入框
    document.body.removeChild(textarea);
  }
};

export const beautifulJson = (val: string = '{}') => {
  let finalVal = val;
  try {
    finalVal = JSON.stringify(JSON.parse(val), null, 2);
  } catch {

  }
  return finalVal;
}