
"use strict";

let mysql = require("mysql"),
    bcrypt = require("bcryptjs"),
    fs = require("fs");

let db;

function connectSQL(data) {

	//Setup MySQL connection
	db = mysql.createConnection(data);

    //Report successful createConnection
	db.connect(function(err) {

		if (err) {

            console.log("Unable to connect to MySQL on " + data.host + ", trying again");
			connectSQL(data);

		} else console.log("MySQL connected");

	});

    //Report error and reconnect
	db.on("error", function() {

		console.log("MySQL disconnected, reconnecting");
		connectSQL(data);

	});

}

fs.readFile("config.json", "utf8", function (err, data) {

	//Did we get a file?
	if (err) throw new Error("Config file missing or corrupt.\nThere should be a 'config.json' in the root directory.");

	//Is it JSON?
	try {

		data = JSON.parse(data);

	} catch (jsonErr) {

        throw new Error("Config file is not valid JSON!");

	}

	connectSQL(data);

});

function getUser(user) {

    return function(callback) {

        let query = "select rid, password, first, last from user where rid = ? or nshe = ? or concat(first, ' ', last) = ?";
        db.query(query, [user, user, user], function(err, rows) {

            callback(err, rows[0]);

        });

    };

}

function testPass(attemptPassword, truePassword) {

    return function(callback) {

        bcrypt.compare(attemptPassword, truePassword, function(err, res) {

            callback(err, res);

        });

    };

}

function permsCallback(username, callback) {

    let query = "\
        select name\
        from user_roles, user, action_permissions, action\
        where user = user.id and action_permissions.user_role = user_roles.id\
        and action_permissions.action = action.id and user.rid = ?";

    db.query(query, [username], function(err, rows) {

        let i, perms = [];

        if (err) callback(err);
        
        for (i = 0; i < rows.length; i++)
            perms.push(rows[i].name);

        callback(null, perms);

    });

}

module.exports = {
    getUser: getUser,
    testPass: testPass,
    permsCallback: permsCallback
};
