/* jshint node: true, strict: true */

"use strict";

var winston     = require('winston'),
    WebSocket   = require('ws'),
    optimist    = require('optimist');



var ws = new WebSocket('ws://localhost:7070/foo');
var remote;

ws.on('open', function() {
    ws.send('something');
});

ws.on('error', function(err){
    if(err.code === 'ECONNREFUSED') {
        console.log('Could not connect to server');
    }
});

ws.on('message', function(data) {

    var obj = {};

    try {
        obj = JSON.parse(data);
        
        if (obj.type === 'init') {

            remote = new (winston.Logger)({
                transports: [
                    new (winston.transports.Console)({
                        colorize: true,
                        level : obj.data.level
                    })
                ],
                levels: obj.data.levels,
                colors: obj.data.colors
            });

            var l = obj.data.backlog.length,
                i = 0;

            for(i = 0; i < l; i += 1){
                remote.log(obj.data.backlog[i].level, obj.data.backlog[i].msg, obj.data.backlog[i].meta);
            }

        } else if (obj.type === 'log') {
            remote.log(obj.data.level, obj.data.msg, obj.data.meta);
        }

    } catch(err) {
        console.log(err);

    }

});