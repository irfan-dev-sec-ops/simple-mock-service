const morganBody = require('morgan-body');
const jsonServer = require('json-server');

const server = jsonServer.create();
const middlewares = jsonServer.defaults({ logger: false });

const router = jsonServer.router(require('./db.js')());
let db = router.db;
const baseUrl = "/students-api/v1/";

server.use(middlewares);
server.use(jsonServer.bodyParser);

morganBody(server, {
    noColors: true,
    skip: (req) => !!req.url.match(/(management\/health)$/gi),
    prettify: false,
    logAllReqHeader: true,
    logAllResHeader: false,
    includeNewLine: true
});

// Middleware to add delay based on api-delay header
server.use((req, res, next) => {
    const apiDelay = req.headers['api-delay'];
    if (apiDelay && !isNaN(apiDelay)) {
        setTimeout(next, Number(apiDelay));
    } else {
        next();
    }
});

// Middleware to override status code based on api-status-code header
server.use((req, res, next) => {
    const apiStatusCode = req.headers['api-status-code'];
    if (apiStatusCode && !isNaN(apiStatusCode)) {
        const statusCode = Number(apiStatusCode);
        res.statusCode = statusCode;
        if (statusCode >= 400) {
            return res.json({
                code: statusCode,
                message: "Error Occurred while processing"
            });
        }
    }
    next();
});
server.use((req, res, next) => {
    if (req.path === baseUrl + "management/health") {
        res.status(200).json({ status: "UP" });
    } else {
        next();
    }
});

server.get(baseUrl + "students", (req, res) => {
    res.status(200).json(db.get("students").value());
});

server.get(baseUrl + "students/:id", (req, res) => {
    const studentId = parseInt(req.params.id, 10);
    console.log("Requested student ID:", studentId);

    const student = db.get("students").find({ id: studentId }).value();
    console.log("Found student:", student);
    if (student) {
        res.status(200).json(student);
    } else {
        res.status(404).json({ code: 404, message: "Student not found" });
    }
});

server.post(baseUrl + "students", (req, res, next) => {
    const { id, name, age } = req.body;
    if (typeof id === 'number' && typeof name === 'string' && typeof age === 'number') {
        next();
    } else {
        res.status(400).json({ code: 400, error: "Invalid student object" });
    }
}, (req, res) => {
    const newStudent = req.body;
    db.get("students").push(newStudent).write();
    res.status(201).json(newStudent);
});

server.use((req, res, next) => {
    if (!req.path.startsWith(baseUrl)) {
        res.status(404).json({ error: "Not found" });
    } else {
        next();
    }
});

module.exports = server;