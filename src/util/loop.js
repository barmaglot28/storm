/**
 * only for synchronous callbacks!
 */
function forEach(arr, cb) {
    if (!arr.length) {
        return;
    }

    var i = -1;
    while (++i < arr.length) {
        cb(arr[i]);
    }

    return arr;
}

module.exports = {
    forEach: forEach,
};
