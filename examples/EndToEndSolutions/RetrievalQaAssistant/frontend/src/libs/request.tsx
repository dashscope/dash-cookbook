import request from '@uni/request';

import Toast from '@/components/Toast';
interface IRequest {
  url: string | '';
  method?: "POST" | "GET";
  data?: any;
  ignoreLogin?: boolean;
  timeout?: number;
  options?: { disableTip?: boolean; abortSignal? };
}

export const isPre = /^pre-/.test(location.host);

// export const HOST = 'http://localhost:8080';
export const HOST = '';

export const httpRequest = ({
  url = '',
  method = 'POST',
  data = {},
  options = {},
  timeout = 20000,
}: IRequest) => {
  const reqUrl = `${HOST + url}`;
  return new Promise<{ data: any }>((resolve, reject) => {
    const task = request({
      url: reqUrl,
      method,
      timeout,
      // withCredentials: true,
      data,
      headers: {
        'X-XSRF-TOKEN': window.csrfToken,
        'X-Platform': 'pc_tongyi',
      },
      success: (res) => {
        const { data } = res;

        if (data?.failed || data?.errorCode) {
          if (!options.disableTip) {
            Toast.show({
              center: data?.errorCode === '4001',
              type: 'error',
              message: data.errorMsg || '系统异常，请稍后重试',
            });
          }
          reject({ errorCode: data.errorCode, errorMsg: data.errorMsg });
          return;
        }
        resolve(data);
      },
      fail: (err) => {
        if (`${err.code}` === '0') {
          Toast.show({ message: '网络异常，请稍后重试', type: 'error' });
          return reject({ message: '网络异常' });
        }
        const apiArr = [""]; // 需要底层放过抓错的api
        if (!apiArr.includes(url) && !err.success) {
          err.errorCode === 'error' &&
            Toast.show({ message: err.errorMsg, type: 'error' });
        } else {
          resolve(err); // 非正常业务逻辑 也用resolve 暴露出去，方便接收（不用try）
        }
      },
    });

    if (options.abortSignal) {
      options.abortSignal.onabort = () => {
        task.abort();
      };
    }
  });
};
