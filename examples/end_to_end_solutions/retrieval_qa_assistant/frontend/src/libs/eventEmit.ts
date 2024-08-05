class EventEmit {
  private eventMap = Object.create(null);

  on(fcn: string, cb: (...args: any[]) => void) {
    if (!this.eventMap.fcn) {
      this.eventMap[fcn] = [cb];
    } else {
      this.eventMap[fcn].push(cb);
    }
  }
  off(name: string, fn: Function) {
    if (!this.eventMap[name]) return;
    const id = this.eventMap[name].indexOf(fn);
    if (id !== -1) this.eventMap[name].splice(id, 1);
  }
  emit(fcn: string, ...args: any[]) {
    // console.log('emit fcn',fcn,this.eventMap)
    const fcns = this.eventMap[fcn];
    if (!fcns || !fcns.length) return;
    for (let cb of fcns) {
      cb.apply(fcn, args);
    }
  }
}
const eventEmit = new EventEmit();

export default eventEmit;
