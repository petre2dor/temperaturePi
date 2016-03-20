var fs = require('fs');
fs.appendFileSync('log/error/2016.log', 'start');
var config = require('./config.json');
// read temperature file
var temperature_inside = fs.readFileSync('sampledata', 'utf8');
var temperature_outside = fs.readFileSync('sampledata1', 'utf8');
var errorSentToday = fs.readFileSync('errorSentToday.flag', 'utf8');

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
var flag = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

var email   = require("./node_modules/emailjs/email");
var server  = email.server.connect({
   user:    config.email.user,
   password:config.email.pass,
   host:    config.email.host,
   ssl:     true
});


try {
    // if there is a valid temperature to read
    if (temperature_inside.indexOf('YES') < 0) {
        throw 'Temperature inside invalid!';
    }
    var array = temperature_inside.split('=');
    var temperature = parseInt(array.pop())/1000;
    var inside = temperature;

    if (temperature_outside.indexOf('YES') < 0) {
        throw 'Temperature outside invalid!';
    }
    array = temperature_outside.split('=');
    temperature = parseInt(array.pop())/1000;
    var outside = temperature;
    str = date_and_time  + ',' + inside + ',' + outside + '\n';

    fs.appendFileSync('log/temperature/' + year, str);
    fs.appendFileSync('log/temperature/' + month, str);
    fs.appendFileSync('log/temperature/' + day, str);
} catch (e) {
    // log temp data
    fs.appendFileSync('log/error/'+now.getFullYear()+'.log',
        date_and_time + ': \n' +
        e + "\n" +
        temperature_inside + "\n" +
        temperature_outside + "\n"
    );

    if(errorSentToday != flag){
        //update flag
        fs.writeFileSync('errorSentToday.flag', flag);

        // send email error
        server.send({
            text:            'Something went wrong on TempPi: ' + temperature_inside,
            from:            config.email.from,
            to:              config.email.to,
            subject:         'Error on TempPi',
            'In-Reply-To':   config.email.inReplyToErr,
            References:      config.email.inReplyToErr
        }, function(err, message) {
            if(err){
                // log err
                fs.appendFileSync('log/error/'+now.getFullYear()+'.log' , date_and_time + ': email error - ' + err + "\n");
            }
        });
    }
}
