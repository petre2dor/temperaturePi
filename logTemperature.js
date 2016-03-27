var fs = require('fs');
var config = require('./config.json');

//getting ready some date variables
var now = new Date();
var unix_timestamp = Date.now(); // in milliseconds
var date_and_time = now.getFullYear() + '-' +
    ('00' + (now.getMonth()+1)).slice(-2) + '-' +
    ('00' + now.getDate()).slice(-2) + ' ' +
    ('00' + now.getHours()).slice(-2) + ':' +
    ('00' + now.getMinutes()).slice(-2) + ':' +
    ('00' + now.getSeconds()).slice(-2);
var year = now.getFullYear() + '.csv';
var month = now.getFullYear() + '-' + (now.getMonth() + 1) + '.csv';
var day = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '.csv';

// temperature inside
try {
    // read temperature file
    var temperature_inside = fs.readFileSync('sampledata/inside', 'utf8');
    // if there is a valid temperature to read
    if (temperature_inside.indexOf('YES') < 0) {
        throw 'Temperature inside invalid!';
    }
    var array = temperature_inside.split('=');
    var inside = parseInt(array.pop())/1000;
} catch (e) {
    // log error
    console.log(e);
    fs.appendFileSync('log/error/'+now.getFullYear()+'.log',
        date_and_time + ': \n' + e + "\n"
    );
    sendErrorEmail(config, date_and_time, e);
    var inside = '';
}

// temperature outside
try {
    // read temperature file
    var temperature_outside = fs.readFileSync('sampledata/outside', 'utf8');

    if (temperature_outside.indexOf('YES') < 0) {
        throw 'Temperature outside invalid!';
    }
    var array = temperature_outside.split('=');
    var outside = parseInt(array.pop())/1000;
} catch (e) {
    // log error
    console.log(e);
    fs.appendFileSync('log/error/'+now.getFullYear()+'.log',
        date_and_time + ': \n' + e + "\n"
    );
    sendErrorEmail(config, date_and_time, e);
    var outside = '';
}

var str = date_and_time  + ',' + inside + ',' + outside + '\n';
fs.appendFileSync('log/temperature/' + year, str);
fs.appendFileSync('log/temperature/' + month, str);
fs.appendFileSync('log/temperature/' + day, str);


function sendErrorEmail(config, date_and_time, message){
    var email   = require("./node_modules/emailjs/email");
    var server  = email.server.connect({
       user:    config.email.user,
       password:config.email.pass,
       host:    config.email.host,
       ssl:     true
    });

    var errorSentToday = fs.readFileSync('errorSentToday.flag', 'utf8');
    var now = new Date();
    var flag = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

    if(errorSentToday != flag){
        //update flag
        fs.writeFileSync('errorSentToday.flag', flag);

        // send email error
        server.send({
            text:            'Something went wrong on TempPi: ' + message,
            from:            config.email.from,
            to:              config.email.to,
            subject:         'Error on TempPi',
            'In-Reply-To':   config.email.inReplyToErr,
            References:      config.email.inReplyToErr
        }, function(err, message) {
            console.log(err);
            if(err){
                // log err
                fs.appendFileSync('log/error/'+now.getFullYear()+'.log' , date_and_time + ': email error - ' + err + "\n");
            }
        });
    }
}
