var url = require('url');

function Request (pathRegExp, req) {
    var method = req.method;
    var headers = req.headers;

    this.path = undefined;

    this.body = undefined;
    this.query = undefined;
    this.params = undefined;

    var _self = this;

    this._req = req;

    this._parseBody = function (cb) {
        if (['POST', 'PUT', 'PATCH'].indexOf(method) !== -1) {
            bodyParser(req, function (_body) {
                _self.body = _body;
                cb();
            });
        } else {
            cb();
        }
    };

    this._parseParams = function (_params, cb) {
        if (_params.length === 0) {
            return cb();
        } else {
            _self.params = {};
            var v = "";
            _params.forEach(function (item, index) {
                v += "$" + (index + 1) + ",";
            });
            v = v.substr(0, v.length - 1);
            v = _self.path.replace(pathRegExp, v);
            v = v.split(',');
            _params.forEach(function (item, index) {
                _self.params[item] = v[index];
            });

            cb();
        }
    };

    this._parseQueryAndPath = function () {
        var parsedUrl = url.parse(req.url, true);

        _self.query = parsedUrl.query;
        _self.path = parsedUrl.pathname;
    };
}

function bodyParser (req, cb) {
    var body = '';

    req.on('data', function (chunk) {
        body += chunk.toString();
    });
    req.on('end', function () {
        cb(JSON.parse(body));
    });
}

module.exports = Request;