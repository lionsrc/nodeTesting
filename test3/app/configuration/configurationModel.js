'use strict';

let _configurations = null;

// assume name is the key
function initData(){    
    if (_configurations){
        return;
    }
    _configurations = [];
    _configurations.push ({
        "name" : "host1",
        "hostname" : "nessus-ntp.lab.com",
        "port" : 1241,
        "username" : "toto"
    });
    _configurations.push({
        "name" : "host2",
        "hostname" : "nessus-xml.lab.com",
        "port" : 3384,
        "username" : "admin"
    });

    // initialize more items
    for(let i=0,j=200; i < 100; i++, j--){
        _configurations.push({
            "name" : "host" + (i+50).toString(),
            "hostname" : "nessus-xml" + (Math.random()*100|0).toString() + ".lab.com",
            "port" : 6000 +j ,
            "username" : "user" + i.toString()
        });
    }
}

// simulating the database call back, using error first pattern
function getConfigurationByName(name, callback){
    if (!callback || {}.toString.call(callback) !== '[object Function]'){
        return;
    }
    let config = _configurations.find((elem)=>elem.name === name);
    if (config){
        callback(null, config);
    }else{
        callback(new Error("Can't find the configuration"));
    }
}
function getConfigurations(options, callback){
    if (!callback || {}.toString.call(callback) !== '[object Function]'){
        return;
    }
    if (_configurations){
        let result = _configurations.sort((a, b)=>{
            if (a[options.sortBy] === b[options.sortBy] ){
                return 0;
            }else{
                if (a[options.sortBy] < b[options.sortBy]){
                    return (options.order === 'asc')? -1 : 1;
                }else{
                    return (options.order === 'asc')? 1 : -1;
                }
            }
        }).slice(options.offset, options.offset+ options.limit);
        callback(null, result);
    }else{
        callback(new Error("Can't find the configurations"));
    }
}
function createConfiguration(configData, callback){
    if (!callback || {}.toString.call(callback) !== '[object Function]'){
        return;
    }
    getConfigurationByName(configData.name, (err, config)=>{
        if (config){
            callback(new Error("Configuration alread exists"));
        }else{
            let newConfig = {
                "name" : configData.name,
                "hostname" : configData.hostname,
                "port" : configData.port,
                "username" : configData.username
            };
            _configurations.push(newConfig);
            callback(null, newConfig);
        }
    })
}

function deleteConfiguration(name, callback){
    if (!callback || {}.toString.call(callback) !== '[object Function]'){
        return;
    }
    getConfigurationByName(name, (err, config)=>{
        if (!config){
            callback(new Error("Configuration doesn't exist"));
        }else{
            let index = _configurations.indexOf(config);
            if (index >=0 ){
                _configurations.splice(index, 1);
                callback(null, config);
            }else{
                callback(new Error("Configuration doesn't exist"));                
            }
        }
    })
}
function updateConfiguration(name, configData, callback){
    if (!callback || {}.toString.call(callback) !== '[object Function]'){
        return;
    }
    getConfigurationByName(name, (err, config)=>{
        if (!config){
            callback(new Error("Configuration alread exists"));
        }else{
            config.hostname = configData.hostname;
            config.port = configData.port;
            config.username = configData.username;
            callback(null, config);
        }
    })
}


initData();

module.exports = {
    getConfigurations :     getConfigurations,
    getConfigurationByName: getConfigurationByName,
    createConfiguration:    createConfiguration,
    deleteConfiguration:    deleteConfiguration,
    updateConfiguration:    updateConfiguration
}


