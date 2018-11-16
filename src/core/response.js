function Response (res) {
    this._res = res;

    this.send = function (data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        res.end(data);
    }
}

module.exports = Response;