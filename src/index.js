var Server = require("./core/server");
var server = new Server();

server.post("/storm/:name/:age", function (req, res) {
    console.error(req.body);
    console.error(req.params);

    res.send("200");
});

server.listen(3000, function () {
    console.log("Listen on 3000");
});
