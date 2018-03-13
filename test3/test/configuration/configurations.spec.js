var expect    = require("chai").expect;
var request = require("request");
var base_url = "http://localhost:8088/";

describe("Configuration testings", function() {
    var token, baseRequest;
    
    function arrayIsSortedBy(array, name, isAsc){
        for(var i=0; i < array.length-1; i++){
            if (isAsc && array[i][name] > array[i+1][name]){
                return false;
            }else if (!isAsc && array[i][name] < array[i+1][name]){
                return false;
            }
        }
        return true;
    }
    function getConfigurationByName(name, callback){
        var options = {
            url : base_url + "api/v1/configuration/" + name,
            method: 'GET',
            json: true
        } 

        baseRequest(options, function(error, response, result) {
            if (response.statusCode === 200){
                callback(result);
            }else{
                callback(null);
            }            
        });
        
    }
    function verifyConfiguration(config, done){
        getConfigurationByName(config.name, function(returnConfig){
            if (returnConfig){
                expect(config.name).to.equal(returnConfig.name);
                expect(config.hostname).to.equal(returnConfig.hostname);
                expect(config.port).to.equal(returnConfig.port);
                expect(config.username).to.equal(returnConfig.username);
            }else{
                expect("Can't find the config").to.equal(false);
            }
            done();
        })
    }
    function createConfiguration(config, callback){
        var options = {
            url : base_url + "api/v1/configuration",
            method: 'POST',
            body : JSON.stringify(config),
            json: true
        } 

        baseRequest(options, function(error, response, result) {
            callback(error, response, result);
        });
    }
    function deleteConfiguration(name, callback){
        var options = {
            url : base_url + "api/v1/configuration/" + name,
            method: 'DELETE',
            json: true
        } 

        baseRequest(options, function(error, response, result) {
            callback(error, response, result);
        });
    }


    before(function(done) {
        // runs before all tests in this block

        var options = {
            url : base_url + "login",
            method: 'POST',
            body: JSON.stringify({"username": "user1", password: "password"}),
            json: true,
            headers: {
                'content-type': 'application/json'
            }
        }

        request(options, function(error, response, result) {
            expect(response.statusCode).to.equal(200);  
            expect(result.token).to.not.be.empty;  
            token = result.token;
             baseRequest = request.defaults({
                headers: {  'x-access-token': token,
                            'content-type': 'application/json'
                }
            });
            done();
        });        
    });

    describe("Configuration CRUD testings", function() {
        it("creates a new configuration ", function(done) {
            var newConfig = {
                name: 'test1234',
                hostname: 'test1234.tenable.com',
                port: 1234,
                username: 'user1',
            }
            createConfiguration(newConfig, function(error, response, result){
                expect(response.statusCode).to.equal(200);  
                verifyConfiguration(newConfig, function(){
                    deleteConfiguration(newConfig.name, function(){
                        done();
                    });
                });
                
            })
        });
        
        it("updates a configuration ", function(done) {
            var newConfig = {
                name: 'test2234',
                hostname: 'test1234.tenable.com',
                port: 1234,
                username: 'user1',
            }
            createConfiguration(newConfig, function(error, response, result){
                expect(response.statusCode).to.equal(200);  

                newConfig.hostame = "test555.tenable.com";
                newConfig.port = 5555;

                var options = {
                    url : base_url + "api/v1/configuration/" + newConfig.name,
                    method: 'PUT',
                    body : JSON.stringify(newConfig),
                    json: true
                } 
        
                // update the configuration
                baseRequest(options, function(error, response, result) {
                    expect(response.statusCode).to.equal(200);  
                    verifyConfiguration(newConfig, function(){
                        deleteConfiguration(newConfig.name, function(){
                            done();
                        });        
                    });    
                });                
            })
            
        });

        it("deletes a configuration ", function(done) {
            var newConfig = {
                name: 'test6234',
                hostname: 'test1234.tenable.com',
                port: 1234,
                username: 'user1',
            }
            createConfiguration(newConfig, function(error, response, result){
                expect(response.statusCode).to.equal(200);  

                var options = {
                    url : base_url + "api/v1/configuration/"+newConfig.name,
                    method: 'DELETE',
                    body : JSON.stringify(newConfig),
                    json: true
                } 
                // delete the configuration
                baseRequest(options, function(error, response, result) {
                    expect(response.statusCode).to.equal(200);  
                    getConfigurationByName(newConfig.name, function(returnConfig){
                        if (returnConfig){
                            console.log("return returnConfig:" + JSON.stringify(returnConfig));
                            expect("Didn't delete the config").to.equal(false);
                        }else{                        
                        }
                        done();
                    })
                });                
            })
        });
    })

    describe("Configuration sorting, paging testings", function() {   
        it("returns default first page of list of configurations ", function(done) {
            var options = {
                url : base_url + "api/v1/configurations?sortBy=port&order=desc",
                method: 'GET',
                json: true
            } 

            baseRequest(options, function(error, response, result) {
                expect(response.statusCode).to.equal(200);  
                expect(result.length).to.equal(10);  // the default page size is 10, should be 10 or less in case not enough items
                expect(arrayIsSortedBy(result, "name", true)).to.be.true;
                done();
            });
        });

        it("returns 5 configurations start from 10, sorted by port desc ", function(done) {
            var options = {
                url : base_url + "api/v1/configurations?sortBy=port&order=desc&offset=10&limit=5",
                method: 'GET',
                json: true
            } 

            baseRequest(options, function(error, response, result) {
                expect(response.statusCode).to.equal(200);  
                expect(result.length).to.equal(5);  
                expect(arrayIsSortedBy(result, "port", false)).to.be.true;
                done();
            });
        });

        it("returns 0 configurations when offset is too big sorted by port desc ", function(done) {
            var options = {
                url : base_url + "api/v1/configurations?sortBy=port&order=desc&offset=10000&limit=5",
                method: 'GET',
                json: true
            } 

            baseRequest(options, function(error, response, result) {
                expect(response.statusCode).to.equal(200);  
                expect(result.length).to.equal(0);  
                done();
            });
        });


        it("returns 15 configurations start from 10, sorted by username asc", function(done) {
            var options = {
                url : base_url + "api/v1/configurations?sortBy=username&order=asc&offset=10&limit=15",
                method: 'GET',
                json: true
            } 

            baseRequest(options, function(error, response, result) {
                expect(response.statusCode).to.equal(200);  
                expect(result.length).to.equal(15);  
                expect(arrayIsSortedBy(result, "username", true)).to.be.true;
                done();
            });
        });
    })

    after(function() {
        // runs after all tests in this block
    });    
});