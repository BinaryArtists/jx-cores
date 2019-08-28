export const loop = async (
  {
    initial,
    funcs,
    proc, // result 转化
    count, // funcs 的轮转次数
    nap, // ms
    expires // ms
  }
) => {
  if (!funcs) throw new Error('.promise 不可以为空');
  if (!count) count = 1;

  const localState = initial;

  // initialize fields here
  while (count--) {
    for (var idx in funcs) {
      const func = funcs[idx];
      const result = await func();

      if (proc) {
        
      } else {

      }
      localState = localState.changeStateBasedOnResult(result);

    }
      
  }
  return localState;
}


// const promise1Func = (lastState) => new Promise((resolve, reject) => {
//   resolve(lastState+1);
// });

// const promise2Func = (lastState) => new Promise((resolve, reject) => {
//   resolve(lastState+2);
// });

// loop({ initial: firstState, funcs:[promise1Func,promise2Func], count: 5, nap: 1000, expires: 10000} )

