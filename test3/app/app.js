'use strict';

const http = require('http');

const util = require('./util');
const router = require('./router.js');

function processRequest(request, response){
    let body = [];
    let postDataSize = 0;
    request.on('data', (chunk) => {
        //receving the post data
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        if (util.parseRequestBody(request, response, body)){
            router.routeRequest(request, response);
        }        
    })
}

const server = http.createServer((request, response) => {
    request.on('error', (err) => {
        console.error(err);
        util.sendResult(response, 400);
    });
    response.on('error', (err) => {
        console.error(err);
    });
    
    processRequest(request, response);

}).listen(8088);