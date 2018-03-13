'use strict';

const querystring = require('querystring');

const settings = require("../settings");
const util = require("../util");
const configurationModel = require("./configurationModel");


function getConfigurations(request, response){
    configurationModel.getConfigurations( (err, configs)=>{
        if (err){
            util.sendResult(response, 404); //not found
        }else{
            util.sendResult(response, 200, configs);
        }
    });
}
function getConfigurationByName(request, response){
    let name = "";
    if (request.params && request.params['name']){
        name = request.params['name'];
    }
    if (name){
        configurationModel.getConfigurationByName(name, (err, config)=>{
            if (err){
                util.sendResult(response, 404, {message: "Error getting the configuraiton"});
            }else{
                util.sendResult(response, 200, config);
            }
        });
    }else{
        util.sendResult(response, 400, {message: 'Invalid parameters getting configuration'});
    }
}
function createConfiguration(request, response){
    let configData = request.body;
    if (configData && configData.name){ // only name is required to create a new one?
        configurationModel.createConfiguration(configData, (err, config)=>{
            if (err){
                util.sendResult(response, 500, {message: 'Failed to create configuraiton'});
            }else{
                util.sendResult(response, 200, config);
            }
        });
    }else{
        util.sendResult(response, 400, {message: 'Invalid parameters to create configuration'});
    }
}

function deleteConfiguration(request, response){
    let name = "";
    if (request.params && request.params['name']){
        name = request.params['name'];
    }
    if (name){
        configurationModel.deleteConfiguration(name, (err, config)=>{
            if (err){
                util.sendResult(response, 400, {message: "Error deleting the configuraiton"});
            }else{
                util.sendResult(response, 200);
            }
        });
    }else{
        util.sendResult(response, 400, {message: 'Invalid parameters to delete configuration'});
    }
}
function updateConfiguration(request, response){
    let name = "";
    if (request.params && request.params['name']){
        name = request.params['name'];
    }
    let configData = request.body;
    if (name && configData && configData.name && name === configData.name){ 
        configurationModel.updateConfiguration(name, configData, (err, config)=>{
            if (err){
                util.sendResult(response, 400, {message: "Error updating the configuraiton"});
            }else{
                util.sendResult(response, 200);
            }
        });
    }else{
        util.sendResult(response, 400, {message: 'Invalid parameters to update configuration'});
    }
}

module.exports = {
    getConfigurations :     getConfigurations,
    getConfigurationByName :     getConfigurationByName,
    createConfiguration:    createConfiguration,
    deleteConfiguration:    deleteConfiguration,
    updateConfiguration:    updateConfiguration
}
