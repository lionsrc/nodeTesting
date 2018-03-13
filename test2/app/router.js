'use strict';

const url = require('url');
const querystring = require('querystring');

const util = require('./util');
const auth = require('./auth');
const configuration = require('./configuration');

let _routers = null;

// a simple router implementation, only supports one parameter at the end of url path
function addRouter(method, curUrl, handler, requireAuth){
    let router = {
        method: method,
        url:    curUrl,
        handler:   handler,
        requireAuth:  requireAuth
    };

    //  url parameters
    let index = curUrl.indexOf(":");
    if (index > 0){
        router.parameter = curUrl.substring(index+1);   //'/api/v1/configuration/:name' ==> parameter='name'
        router.url = curUrl.substring(0, index);     //'/api/v1/configuration/:name' ==>'/api/v1/configuration/' , with slash
    }

    _routers.push(router);
}

function initRouters(){
    if (!_routers){
        _routers = [];
    }

    // login :      POST /login     data: {username:username, password:password} or application/x-www-form-urlencoded
    // logout :     POST /logout
    addRouter('POST', '/login', auth.processLogin, false);
    addRouter('POST', '/logout', auth.processLogout, true);

    // get configurations :  GET /api/v1/configurations
    // get configuration by name :  GET /api/v1/configuration/name
    // create configurations :  POST /api/v1/configuration
    // delete configurations :  DELETE /api/v1/configuration/name
    // modify configurations :  PUT /api/v1/configuration/name    
    addRouter('GET', '/api/v1/configurations', configuration.getConfigurations, true);
    addRouter('GET', '/api/v1/configuration/:name', configuration.getConfigurationByName, true);
    addRouter('POST', '/api/v1/configuration', configuration.createConfiguration, true);
    addRouter('DELETE', '/api/v1/configuration/:name', configuration.deleteConfiguration, true);
    addRouter('PUT', '/api/v1/configuration/:name', configuration.updateConfiguration, true);

}

function routeRequest(request, response){

    // CORS headers
    response.setHeader("Access-Control-Allow-Origin", "*"); // all all domains for now, can restrict it to the required domains
    response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');

    // Set custom headers for CORS
    response.setHeader('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token');
    if (request.method === 'OPTIONS') {
        util.sendResult(response, 200);
        return;
    }

    let reqUrl = url.parse(request.url);
    let pathname = reqUrl.pathname;    

    // save the query string as on object in request.query
    if (reqUrl.query){
        request.query = querystring.parse(reqUrl.query);
    }

    //find the router matches the method and url 
    let router = _routers.find((elem)=>elem.method === request.method && pathname.indexOf(elem.url) === 0);
    if (router){
        request.query = request.query || {};
        request.params = request.params || {};

        if (router.requireAuth){
            if (!auth.getCurrentAuthenticatedUser(request)){
                util.sendResult(response, 403);  //403 Forbidden
                return;
            }
        }
        if (router.parameter){
            // save the url parameter to the request.params
            let value = request.url.substring(router.url.length);
            if (value){
                request.params[router.parameter] = value;
            }
        }

        router.handler(request, response);
    }else{
        // all the handled request should return already
        console.log("We received an invalid url request: " + request.url + "  method: " + request.method);
        util.sendResult(response, 404);
    }
}

initRouters();
module.exports.routeRequest = routeRequest;
