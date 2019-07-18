export class Singleton {
  static instance;
  constructor() {}

  static sharedInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }

    return Singleton.instance;
  }
}
