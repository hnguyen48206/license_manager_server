const app = require('express')();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})
const { celebrate } = require('celebrate');
const { errors } = require('celebrate');

const Joi = require('joi')
    .extend(require('@joi/date'));

const macs = require('os').networkInterfaces()
// console.log(macs)
const APP_PORT = process.env.APP_PORT ? process.env.APP_PORT : '1010';
var fs = require('fs');
const jwt = require("jsonwebtoken");
var publicKEY = fs.readFileSync('./assets/public.key', 'utf8');

function verifyMacAddress(mac) {
    if (isObject(macs)) {
        let check = false
        for (const [key, value] of Object.entries(macs)) {
            if (value.length > 0) {
                value.forEach(interface => {
                    if (interface.mac.toLowerCase() == mac.toLowerCase())
                        check = true;
                });
            }
        }
        return check;
    }
    else
        return false;
}

function isObject(val) {
    if (val === null) { return false; }
    return ((typeof val === 'function') || (typeof val === 'object'));
}

//////////////////////////////// License API //////////////////////////////////
app.post('/verify_license', celebrate({
    body: Joi.object({
        licenseKey: Joi.string().min(10).max(5000).required()
    })
}), function (req, res) {
    let message = '';
    let decoded_payload = null;
    jwt.verify(req.body.licenseKey, publicKEY, function (err, decoded) {
        if (err) {
            // console.log(err.name);
            if (err.name == 'TokenExpiredError')
                message = 'expired'
            else
                message = 'invalid'
        }
        else {
            let payload = jwt.decode(req.body.licenseKey);
            if (payload['MAC'] != null && verifyMacAddress(payload['MAC'])) {
                message = 'valid';
                decoded_payload = payload;
            }
            else
                message = 'wrong server indentification'
        }
        res.send({
            code: 1,
            message: message,
            payload: decoded_payload
        })
    });
});

process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

process.on('exit', function (code) {
    // Following code will never execute.
    console.log('App about to exit with code:', code);
});


// celebrate error handler, must be placed after all routes definition to works.
app.use(errors());
const server = require('http').Server(app);
server.listen(APP_PORT, "0.0.0.0", function (error) {
    if (error) {
        console.error("Unable to listen on port", APP_PORT, error);
        return;
    }
    else {
        console.log('Server is listening on port', APP_PORT);
    }
})




