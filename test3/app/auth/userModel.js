'use strict';

let _users = null;
let _userTokens = {};

// assume username is the key
// for simplicity, we just use real password instead of the hashed one
function initData(){
    if (_users){
        return;
    }
    _users = [];
    _users['user1'] = {
        username: 'user1',
        password: 'password',   
    };
    _users['user2'] = {
        username: 'user2',
        password: 'password',
    };
}

function getUsernameByAccessToken(token){
    let keys = Object.keys(_userTokens);
    for(let i = 0; i < keys.length; i++){
        if (_userTokens[keys[i]].token === token){
            // check token expiration?
            return keys[i];
        }
    }
}
function getUserByUsername(username){
    if (username && _users[username]){
        return _users[username];
    }
}
function getUserAccessToken (username){
    if (username && _userTokens[username]){
            // check token expiration?
        return _userTokens[username].token;
    }
}
function saveUserAccessToken(username, token){
    _userTokens[username] = {token: token, timestamp: new Date().valueOf()};
}
function deleteUserAccessToken (username){
    if (_userTokens[username]){
        delete _userTokens[username];
    } 
}


initData();

module.exports = {
    getUserByUsername       :   getUserByUsername,
    getUserAccessToken      :   getUserAccessToken,
    saveUserAccessToken     :   saveUserAccessToken,
    deleteUserAccessToken   :   deleteUserAccessToken,
    getUsernameByAccessToken:   getUsernameByAccessToken
}


