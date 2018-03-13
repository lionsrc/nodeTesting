'use strict';

const crypto = require('crypto');

const settings = require("../settings");
const util = require("../util");
const userModel = require("./userModel");

function generateUserToken(username){
    const hmac = crypto.createHmac('sha256', settings.auth.SUPER_SECRET);
    return hmac.update(username + new Date().valueOf().toString()).digest('base64');
}
function loginUser(username, password){
    let user = userModel.getUserByUsername(username);
    if (user && user.password === password){
        return generateUserToken(username);
    }
}
function logoutUser(username){
    userModel.deleteUserAccessToken(username);
}

function getCurrentAuthenticatedUser(request){
    let token = request.headers['x-access-token'];
    if (token){
        return userModel.getUsernameByAccessToken(token);
    }
}

function processLogin (request, response){
    if (request.body && request.body.username && request.body.password){
        let token = loginUser(request.body.username, request.body.password);
        if (token){
            // save the token as a bearer access token for future authentication
            userModel.saveUserAccessToken(request.body.username, token);

            util.sendResult(response, 200, {token: token});
        }else{
            util.sendResult(response, 403);
        }
    }else{
        util.sendResult(response, 403);
    }
}

function processLogout (request, response){
    let username = getCurrentAuthenticatedUser(request);
    if (username){
        logoutUser(username);
        
        util.sendResult(response, 200);
    }else{
        util.sendResult(response, 400);
    }
}
module.exports = {
    getCurrentAuthenticatedUser : getCurrentAuthenticatedUser,
    processLogin : processLogin,
    processLogout : processLogout,
}