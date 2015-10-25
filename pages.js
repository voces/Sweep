
let fs = require("fs"),
    path = require("path"),

    Router = require("koa-router");

function readFileThunk(src) {

    return new Promise(function (resolve, reject) {

        fs.readFile(src, {encoding: "utf8"}, function (err, data) {

            if (err) return reject(err);
            resolve(data);

        });

    });

}

export.pages = new Router()
    .get("/", function *() {

        this.body = yield readFileThunk(path.join(__dirname, "/public/index.html"));

    })

    .get("/course", function *() {

        this.body = yield readFileThunk(path.join(__dirname, "/public/course.html"));

    })
    .get("/course/*", function *() {

        this.body = "Course frameowrk";

    })

    .get("/section", function *() {

        this.body = yield readFileThunk(path.join(__dirname, "/public/section.html"));

    })
    .get("/section/*", function *() {

        this.body = "Course frameowrk";

    })

    .get("/profile", function *() {

        this.body = yield readFileThunk(path.join(__dirname, "/public/profile.html"));

    })
    .get("/profile/*", function *() {

        this.body = "Their profile";

    });
