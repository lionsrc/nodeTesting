'use strict';

const querystring = require('querystring');

const FIRST_CHAR_REGEXP = /^[\x20\x09\x0a\x0d]*(.)/ 

function sendResult(response, statusCode, jsonObj){
    response.statusCode = statusCode;
    if (jsonObj){
        response.end(JSON.stringify(jsonObj));
    }else{
        response.end();
    }        
}

function getFirstChar(body){
    return FIRST_CHAR_REGEXP.exec(body)[1];
}
function parseRequestBody(request, response, body){
    if (body){
        try{
            let firstChar = getFirstChar(body);
            if ((request.headers['content-type'] && request.headers['content-type'].indexOf('application/json')>=0) && (firstChar === "{" || firstChar === '[')){
                // parse the JSON body and save it to request object
                let bodyJson = JSON.parse(body);
                request.body = bodyJson;
            }else{
                // try urlencode body
                request.body = querystring.parse(body);
            }
        }catch(err){
            console.log("Error parsing request body");
            sendResult(response, 400); //bad request
            return false;
        }
    }
    request.body = request.body ||{};
    return true;
}
module.exports = {
    parseRequestBody : parseRequestBody,
    sendResult : sendResult,
}