var fs = require('fs');
var config = require('./config.json');

var now = new Date();
var date_and_time = now.getFullYear() + '-' +
    ('00' + (now.getMonth()+1)).slice(-2) + '-' +
    ('00' + now.getDate()).slice(-2) + ' ' +
    ('00' + now.getHours()).slice(-2) + ':' +
    ('00' + now.getMinutes()).slice(-2) + ':' +
    ('00' + now.getSeconds()).slice(-2);

var email   = require("./node_modules/emailjs/email");
var server  = email.server.connect({
   user:    config.email.user,
   password:config.email.pass,
   host:    config.email.host,
   ssl:     true
});

//go back one day
var yesterday = new Date();
yesterday.setDate(yesterday.getDate()-1);

if(now.getDate() == 1){
    // send montly data
    filename = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1);
    sendEmail('Montly temperature data', filename);
    if(now.getMonth() == 0){
        //send yearly data
        filename = yesterday.getFullYear();
        sendEmail('Yearly temperature data', filename);
    }
}

//send daily data
filename = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate();
sendEmail('Daily temperature data', filename);

function sendEmail(subject, filename) {
    // send the message and get a callback with an error or details of the message that was sent
    server.send({
        text:            'See attachment',
        from:            config.email.from,
        to:              config.email.to,
        subject:         subject + ' - ' + date_and_time,
        'In-Reply-To':   config.email.inReplyTo,
        References:      config.email.inReplyTo,
        attachment:
        [
          {path:'./log/temperature/'+filename+'.csv', type:"text/plain", name:filename+'.csv'}
        ]
    }, function(err, message) {
        if(err){
            // log err
            fs.appendFileSync('log/error/'+now.getFullYear()+'.log' , date_and_time + ': email error - ' + err + "\n");
        }
    });
}
