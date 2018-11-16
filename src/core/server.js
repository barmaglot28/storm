var url = require('url');
var http = require('http');

var Request = require('./request');
var Response = require('./response');

function parseUrlAndParams(url) {
    var _url = url;

    if (_url === undefined) {
        _url = '/';
    }
    if (_url[0] !== '/') {
        _url = '/' + _url;
    }
    if (_url.length > 1 && _url[_url.length - 1] === '/') {
        _url = _url.substr(0, _url.length - 1);
    }

    var midParams = _url.match(/\/:[^\/]+\//g) || [];
    var endParams = _url.match(/\/:[^\/]+$/g) || [];
    var params = midParams.concat(endParams).map(function (i) {
        return i[i.length - 1] === '/' ? i.substr(2, i.length - 3) : i.substr(2);
    });

    _url = _url.replace(/([().\\\/^$]{1})/g, '\\$1');
    _url = _url.replace(/\/:[^\/]+\//g, '/(.[^\\/]+)/');
    _url = _url.replace(/\/:[^\/]+$/, '/(.[^\\/]+)');
    _url = '^' + _url + '$';

    return {
        url: new RegExp(_url),
        params: params,
    };
}

function initializeRoute(method, url, handler) {
    var _url = url;
    var _handler = handler;

    if (typeof _url === 'function') {
        _url = undefined;
        _handler = url;
    }

    var urlAndParams = parseUrlAndParams(_url);

    _url = urlAndParams.url;
    var params = urlAndParams.params;
    var cb = function (req, res) {
        var response = new Response(res);
        var request = new Request(_url, req);

        request._parseQueryAndPath();
        request._parseBody(function () {
            request._parseParams(params, function () {
                _handler(request, response);
            })
        })
    };

    return {
        method: method,
        url: _url,
        cb: cb,
    }
}

module.exports = function () {
    var routes = [];
    var notFound;

    this.get = function (url, cb) {
        routes.push(initializeRoute('GET', url, cb));
    };

    this.post = function (url, cb) {
        routes.push(initializeRoute('POST', url, cb));
    };

    this.notFound = function (cb) {
        notFound = cb;
    };

    this.listen = function (port, cb) {
        if (notFound === undefined) {
            notFound = function (req, res) {
                res.end('404');
            }
        }

        var app = http.createServer(function (req, res) {
            var reqUrl = url.parse(req.url, true);
            var found = false;
            var i = -1;
            while (++i < routes.length && !found) {
                if (routes[i].method === req.method && routes[i].url.test(reqUrl.pathname)) {
                    routes[i].cb(req, res);
                    found = true;
                }
            }

            if (!found) {
                notFound(req, res);
            }
        });

        app.listen(port, cb);

        return app;
    };
};
