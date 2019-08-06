export var to = function (promise) {
  return promise.then(data => {
    return [ null, data ]
  })
  .catch(err => [ err, null ])
}