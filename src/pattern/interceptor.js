export class Interceptor {
  constructor(before = () => {}, after = () => {}) {
    this.before = before;
    this.after = after;
  }
}
