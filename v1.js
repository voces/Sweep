
"use strict";

let Router = require("koa-router"),
    db = require("./db.js");

function csClasses(callback) {

	let query = "select * from course where subject = 'CS'";
	db.query(query, function(err, rows) {

		callback(err, rows ? JSON.stringify(rows) : null);

	});

}

function getCourse(callback) {

    let query = "select * from course where subject = ? and number = ?";
	db.query(query, [this.params.subject, this.params.number], function(err, rows) {

		callback(err, rows && rows instanceof Array ? JSON.stringify(rows[0]) : null);

	});

}

function getSection(callback) {

    let query = "select * from section, course where section.course = course.id and subject = ? and number = ? and section = ?";
	db.query(query, [this.params.subject, this.params.number, this.params.section], function(err, rows) {

		callback(err, rows && rows instanceof Array ? JSON.stringify(rows[0]) : null);

	});

}

function notAuthorized(that) {

    that.status = 401;
    that.body = "Not authorized";
    return true;

}

function enforcePermissions(permission, that) {

    if (that.session === null) return notAuthorized(that);
    else if (!(that.session.permissions instanceof Array)) return notAuthorized(that);
    else if (that.session.permissions.indexOf(permission) < 0) return notAuthorized(that);
    return false;

}

function addUser(callback) {

    let post = {
            first: this.query.first,
            last: this.query.last,
            nshe: this.query.nshe,
            rid: this.query.rid
        };

    if (this.query.middle) post.middle = this.query.middle;
    if (this.query.email) post.email = this.query.email;
    if (this.query.email) post.dob = this.query.dob;

    if (this.query.password)

        bcrypt.hash(this.query.password, 12, function(err, hash) {

            if (err) {

                callback(err);
                return;

            }

            post.password = hash;

            db.query("insert into user SET ?", post, function(dbError, rows) {

                callback(dbError, rows ? true : false);

            });

        });
    else
        db.query("insert into user SET ?", post, function(err, rows) {

            callback(err, rows ? true : false);

        });

}

function res401(content) {

    this.status = 401;
    this.body = JSON.stringify(content);

}

module.exports = new Router()
    .post("/login/:user/:password", function *() {

        let user = yield db.getUser(this.params.user);

        if (user)
            if (yield db.testPass(this.params.password, user.password)) {

                yield this.regenerateSession();
                this.session.username = user.rid;
                this.session.first = user.first;
                this.session.last = user.last;

                this.body = JSON.stringify({
                    id: "login",
                    result: "success",
                    body: {
                        first: this.session.first,
                        last: this.session.last
                    }
                });

                setTimeout(function() {

                    db.permsCallback(this.session.username, function(perms) {

                        this.session.permissions = perms;
                        //console.log("perms", this.session);

                    }.bind(this));

                }.bind(this), 0);

            } else res401.call(this, {
                id: "login",
                result: "failure",
                body: "password"
            });

        else res401.call(this, {
            id: "login",
            result: "failure",
            body: "username"
        });

    })
    .post("/logout", function *() {

        this.username = this.session.username;
        this.session = null;
        this.status = 200;
        this.body = JSON.stringify({
            id: "logout",
            result: "success"
        });

    })

    .post("/addUser", function *() {

        if (enforcePermissions("addUser", this)) return;

        if (!this.query.first) {

            this.status = 400;
            this.body = "Missing first";

        } else if (!this.query.last) {

            this.status = 400;
            this.body = "Missing last";

        } else if (!this.query.rid) {

            this.status = 400;
            this.body = "Missing rid";

        } else if (!this.query.nshe || !this.query.nshe.match(/^[0-9]{10}$/)) {

            this.status = 400;
            this.body = "Missing or malformed NSHE";

        /*} else if (!this.query.email || !this.query.email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]+$/i)) {
            this.status = 400;
            this.body = "Missing or malformed email";*/

        } else

            try {

                yield addUser;
                this.status = 200;

            } catch (err) {

                this.status = 409;
                this.body = err.stack.split("\n")[0];

            }

    })

    .get("/course/:subject/:number", function *() {

        this.body = yield getCourse;

    })
    .get("/courses*", function *() {

        console.log("search");
        //yield csClasses;
        this.body = "Course search";

    })

    .get("/section/:subject/:number/:section", function *() {

        this.body = yield getSection;

    })
    .get("/sections*", function *() {

        this.body = "Section search";

    })

    .get("/profiles*", function *() {

        this.body = "Profile search";

    })
    .get("/profile/:subject/:number/:section", function *() {

        this.body = "Profile data";

    });
