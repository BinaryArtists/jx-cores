export var to = function (promise) {
  return promise.then(data => {
    return [ null, data ]
  })
  .catch(err => [ err ])
}

/// Usage
// async function asyncFunctionWithThrow() {
//  const [err, user] = await to(UserModel.findById(1));
//  if (!user) throw new Error('User not found');
// }