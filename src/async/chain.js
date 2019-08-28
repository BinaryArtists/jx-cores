var to = function (promise) {
  return promise.then(data => {
    return [ null, data ]
  })
  .catch(err => [ err, null ])
}

export const chain = async (funcs, filter) => {
  if (typeof funcs == 'array') {
    let ret = null;
    for (let idx in funcs) {
      let promise = funcs[idx];

      if (filter && typeof filter == 'function') {
        ret = filter(ret);
      }

      let [res, err] = await to(promise(ret));

      if (err) {
        throw err;
      }

      ret = res;
    }
  } else {
    throw TypeError('Wrong params');
  }
};