import { fetchEventSource } from '@/libs/fetchEventSource';
import { HOST } from '@/libs/request';

class Rpc {
  baseApi = HOST;
  control = null as any;

  close() {
    this.control?.abort?.();
    this.control = null;
  }

  async conversation(data, { onopen, onmessage, onerror, onclose }) {
    const ctrl = new AbortController();
    this.control = ctrl;
    await fetchEventSource(`${this.baseApi}/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': window.csrfToken,
        'X-Platform': 'pc_tongyi',
      },
      body: JSON.stringify(data),
      credentials: 'include',
      onopen,
      onmessage,
      onerror,
      onclose,
      signal: ctrl.signal,
      openWhenHidden: true,
    });
  }
}

const rpc = new Rpc();
export default rpc;
