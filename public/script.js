
"use strict";

let data = {};

//REST
(function(window) {

    let postDetails = {method: "POST", credentials: "same-origin"};

    function post(url) {

        return fetch(new Request(url, postDetails)).then(function (response) {

            return response.json();

        });

    }

    window.sweep = {

        login: function(username, password) {

            return post("v1/login/" + username + "/" + password);

        },

        logout: function() {

            return post("/v1/logout").then();

        }
    };

}(window));

//Login
(function(window) {

    let sweep = window.sweep,

        loginButton, dialog, form,
        user, pass, submitButton, status,
        name, logout;

    function loginButtonClick() {

        dialog.showModal();

    }

    function logoutClick() {

        sweep.logout();
        loginButton.style.display = "inline-block";
        for (let prop in data) delete data[prop];
        logout.style.display = "none";
        name.textContent = "";

    }

    function disableForm() {

        user.disabled = true;
        pass.disabled = true;
        submitButton.disabled = true;

    }

    function enableForm() {

        user.disabled = false;
        pass.disabled = false;
        submitButton.disabled = false;

    }

    function submit(e) {

        e.preventDefault();

        let username = user.value,
            password = pass.value;

        if (username === "") {

            status.textContent = "Username not provided.";
            user.select();
            return;

        } else if (password === "") {

            status.textContent = "Password not provided.";
            pass.select();
            return;

        }

        disableForm();

        status.textContent = "Logging in...";

        sweep.login(username, password).then(function(res) {

            if (res.result === "success") {

                data.first = res.body.first;
                data.last = res.body.last;

                status.textContent = "";

                enableForm();
                form.reset();
                dialog.close();

                loginButton.style.display = "none";
                logout.style.display = "inline-block";
                name.textContent = data.first + " " + data.last;

            } else if (res.result === "failure") {

                enableForm();

                if (res.body === "username") {

                    status.textContent = "Invalid username.";
                    user.select();

                } else if (res.body === "password") {

                    status.textContent = "Incorrect password.";
                    pass.select();

                }


            }

        });

    }

    document.addEventListener("DOMContentLoaded", function () {

        loginButton = document.getElementById("login-button");
        dialog = document.getElementById("login-dialog");
        form = document.getElementById("login-form");
        user = document.getElementById("login-user");
        pass = document.getElementById("login-pass");
        submitButton = document.getElementById("login-submit");
        status = document.getElementById("login-status");
        name = document.getElementById("login-name");
        logout = document.getElementById("login-logout");

        loginButton.addEventListener("click", loginButtonClick);
        logout.addEventListener("click", logoutClick);

        form.addEventListener("submit", submit);

    });

}(window));
