
export const concurrent = (params, funcs) => {
  return Promise.all(params.map(funcs));
}

// Usage

// const upload = (url) => {
//   return new Promise((resolve,reject) => {
//     //单张上传成功后 得到 res
//     resolve(res);
//   })
// }

// concurrent(  ['uri1','uri2','uri3'], upload )
//   .then( reses => {
//     // 得到所有res啦
//   })