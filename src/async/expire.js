
/**
 * 对异步操作设置超时
 * 
 * @param duration 毫秒
 */
export const expire = (promise, duration) => {
  let expiredFunc = null;
  let expireily = new Promise((resolve, reject) => {
    expiredFunc = () => {
      reject(new Error('超时'));
    };
  });

  setTimeout(() => {
    expiredFunc();
  }, duration);

  return Promise.race([promise, expireily]);;
}

/**
 * 延时
 * 
 * @param duration 毫秒
 */
export const delay = (duration) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, duration);
});