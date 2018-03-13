var expect    = require("chai").expect;
var request = require("request");
var base_url = "http://localhost:8088/";

describe("Test1 Login/Logout", function() {
    describe("Login user1 ", function() {
        it("login user 1 with correct password returns status code 200 and token using json input", function(done) {
            var options = {
                url : base_url + "login",
                method: 'POST',
                body: {"username": "user1", password: "password"},
                json: true,
                headers: {
                    'content-type': 'application/json'
                }
            } 

            request(options, function(error, response, result) {
                expect(response.statusCode).to.equal(200);  
                expect(result.token).to.not.be.empty;  
                done();
            });
        });
        it("login user 1 with correct password returns status code 200 and token using form input", function(done) {
            var options = {
                url : base_url + "login",
                method: 'POST',
                body: "username=user1&password=password",
                json: false,
                headers: {
                    'content-type': 'application/json'
                }
            } 

            request(options, function(error, response, result) {
                expect(response.statusCode).to.equal(200);  
                result = JSON.parse(result);
                expect(result.token).to.not.be.empty;  
                done();
            });
        });
        it("login user 1 with wrong password returns status code not 200 ", function(done) {
            var options = {
                url : base_url + "login",
                method: 'POST',
                body: {"username": "user1", password: "password1"},
                json: true,
                headers: {
                    'content-type': 'application/json'
                }
            } 

            request(options, function(error, response, result) {
                expect(response.statusCode).not.to.equal(200);  
                done();
            });
        });
    });

    describe("Logout user1 ", function() {
        var token;
        before(function(done){
            var options = {
                url : base_url + "login",
                method: 'POST',
                body: {"username": "user1", password: "password"},
                json: true,
                headers: {
                    'content-type': 'application/json'
                }
            } 

            request(options, function(error, response, result) {
                expect(response.statusCode).to.equal(200);  
                expect(result.token).to.not.be.empty;  
                token = result.token;
                done();
            });
        })
        it("returns status code 200 ", function(done) {
            var options = {
                url : base_url + "logout",
                method: 'POST',
                headers: {
                    'x-access-token': token
                }
            } 

            request(options, function(error, response, result) {
                expect(response.statusCode).to.equal(200);  
                done();
            });
        });
    });    
});