export var by = function (func) {
  let ret = null, err = null;
  try {
    ret = func();
  } catch (error) {
    err = error;
  }

  return [ret, err];
}