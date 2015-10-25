//test
"use strict";

let staticCache = require("koa-static-cache"),
    session = require("koa-generic-session"),
    Router = require("koa-router"),
    Koa = require("koa"),

    v1 = require("./v1.js"),

    path = require("path"),
    fs = require("fs");

let app = new Koa(),
    router = new Router();

app.keys = ["UnLvSWeePOcT9"];

function readFileThunk(src) {

    return new Promise(function (resolve, reject) {

        fs.readFile(src, {encoding: "utf8"}, function (err, data) {

            if (err) return reject(err);
            resolve(data);

        });

    });

}

app.use(session({rolling: true, key: "sweep"}));

// x-response-time

app.use(function *(next) {

    let start = new Date(),
        ms;

    yield next;

    ms = new Date() - start;

    this.set("X-Response-Time", ms + "ms");

});

// logger

app.use(function *(next) {

    let start = new Date(),
        username, ms, url;

    yield next;

    username = this.session ? this.session.username || "" : this.username || "";
    ms = new Date() - start;
    url = this.url.indexOf("login") >= 0 ? this.url.split("/").slice(0, 4).join("/") : this.url;

    console.log("[%s] %s %s %s %s %s", new Date().toLocaleTimeString(), username, this.status, this.method, url, ms);

});

app.use(function *(next) {

    if (typeof this.session.startTime === "undefined") this.session.startTime = new Date();

    //console.log(this.session);

    yield next;

});

// response

app.use(staticCache(path.join(__dirname, "public"), {
    maxAge: 365 * 24 * 60 * 60
}));

router
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

router.use("/v1", v1.routes(), v1.allowedMethods());

app.use(router.routes());

app.listen(8089);
