let students = require("./db/students.json");

module.exports = function () {
    return {
        students: students,
    };
};