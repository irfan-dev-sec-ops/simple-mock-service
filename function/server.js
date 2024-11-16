const morganBody = require("morgan-body");
const jsonServer = require("json-server");

console.log("Simple Mock Server is starting");

const server = jsonServer.create();
const middlewares = jsonServer.defaults({logger: false});
const router = jsonServer.router(require("./db.js")(), null);
const baseUrl = "/students-api/v1/";

let db = router.db;

server.use(middlewares);
server.use(jsonServer.bodyParser);

morganBody(server, {
    noColors: true,
    skip: skipLog,
    prettify: false,
    logAllReqHeader: true,
    logAllResHeader: false,
    includeNewLine: true
});

server.use((req, res, next) => {
    if (req.path === baseUrl + "management/health") {
        res.status(200).json({status: "UP"});
    } else {
        next();
    }
});

server.get(baseUrl, (req, res) => {
    let responseData = db.get("students");
    let responseValue = responseData.value();
    res.status(200).json(responseValue);
});

server.get(baseUrl + "students/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const student = db.get("students").find({ id: id }).value();

    if (student) {
        res.status(200).json(student);
    } else {
        res.status(404).json({ error: "Student not found" });
    }
});

server.use((req, res, next) => {
    if (!req.path.startsWith(baseUrl)) {
        res.status(404).json({ error: "Not found" });
    } else {
        next();
    }
});

server.use(router);

function skipLog(req, res) {
    let url = req.url;
    return !!url.match(/(management\/health)$/gi);
}

module.exports = server;