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


const APP_PORT = process.env.APP_PORT ? process.env.APP_PORT : '1010';
var fs = require('fs');
const jwt = require("jsonwebtoken");
var privateKEY = fs.readFileSync('./assets/private.key', 'utf8');
var publicKEY = fs.readFileSync('./assets/public.key', 'utf8');
const sqlite3 = require("sqlite3").verbose();
const filepath = "./data/lite.db";
var database


function createDbConnection() {
    if (fs.existsSync(filepath)) {
        database = new sqlite3.Database(filepath);
    } else {
        database = new sqlite3.Database(filepath, (error) => {
            if (error) {
                return console.error(error.message);
            }
        });
        console.log("Connection with SQLite has been established");
    }
}

//////////////////////////////// Customer API //////////////////////////////////
app.post('/create_customer', celebrate({
    body: Joi.object({
        customerName: Joi.string().min(1).max(200).required(),
        note: Joi.string().min(0).max(500).required()
    })
}), function (req, res) {
    var data = req.body;
    runquery(`INSERT INTO Customers (CustomerName, Note)
    VALUES (?, ?)`,
        [data.customerName, data.note]).then(result => {
            res.send({
                code: 1,
                message: 'Tạo mới _customer thành công',
                data: result
            });
        }).catch(err => {
            res.send({
                code: 0,
                message: 'Tạo mới _customer thất bại',
                data: err
            });
        });
});

app.post('/update_customer', celebrate({
    body: Joi.object({
        customerID: Joi.number()
            .integer()
            .min(0).required(),
        customerName: Joi.string().min(1).max(200).required(),
        note: Joi.string().min(0).max(5000).required(),
        status: Joi.number()
            .integer()
            .min(0)
            .max(1).required(),
    })
}), function (req, res) {
    var data = req.body;
    runquery(
        `UPDATE Customers SET CustomerName = ? , Status = ? ,  Note = ? WHERE CustomerID = ?`,
        [data.customerName, data.status, data.note, data.customerID]
    ).then(result => {
        res.send({
            code: 1,
            message: 'Cập nhật _customer thành công',
            data: result
        });
    }).catch(err => {
        res.send({
            code: 0,
            message: 'Cập nhật _customer thất bại',
            data: err
        });
    });
});

app.post('/delete_customer', celebrate({
    body: Joi.object({
        customerID: Joi.number()
            .integer()
            .min(0).required()
    })
}), function (req, res) {
    var data = req.body;
    runquery(`DELETE FROM Customers WHERE CustomerID = ?`, [data.customerID]).then(result => {
        res.send({
            code: 1,
            message: 'Xóa _customer thành công', data: result
        });
    }).catch(err => {
        res.send({
            code: 0,
            message: 'Xóa _customer thất bại', data: err
        });
    });
});

app.get('/get_all_customers', function (req, res) {
    runSelectQuery(`SELECT * FROM Customers`).then(result => {
        res.send({
            code: 1,
            message: 'Lấy danh sách _customer thành công', data: result
        });
    }).catch(err => {
        res.send({
            code: 0,
            message: 'Lấy danh sách _customer thất bại', data: err
        });
    });
});

//////////////////////////////// License API //////////////////////////////////
app.post('/create_license', celebrate({
    body: Joi.object({
        customerID: Joi.number()
            .integer()
            .min(0)
    })
}), function (req, res) {
    var data = req.body;
    runquery(`INSERT INTO Licenses (CustomerID)
    VALUES (?)`,
        [data.customerID]).then(result => {
            res.send({
                code: 1,
                message: 'Tạo mới _license thành công', data: result
            });
        }).catch(err => {
            res.send({
                code: 0,
                message: 'Tạo mới _license thất bại', data: err
            });
        });
});

app.post('/update_license', celebrate({
    body: Joi.object({
        status: Joi.number()
            .integer()
            .min(0)
            .max(1).required(),
        licenseID: Joi.number()
            .integer()
            .min(0).required(),
        customerID: Joi.number()
            .integer()
            .min(0).required(),
        licenseKey: Joi.string().min(10).max(5000).required()
    })
}), function (req, res) {
    var data = req.body;
    runquery(
        `UPDATE Licenses SET CustomerID = ? , Status = ? ,  LicenseKey = ? WHERE LicenseID = ?`,
        [data.customerID, data.status, data.licenseKey, data.licenseID]
    ).then(result => {
        res.send({
            code: 1,
            message: 'Cập nhật _license thành công', data: result
        });
    }).catch(err => {
        res.send({
            code: 0,
            message: 'Cập nhật _license thất bại', data: err
        });
    });
});

app.post('/delete_license', celebrate({
    body: Joi.object({
        licenseID: Joi.number()
            .integer()
            .min(0).required()
    })
}), function (req, res) {
    var data = req.body;
    runquery(`DELETE FROM Licenses WHERE LicenseID = ?`, [data.licenseID]).then(result => {
        res.send({
            code: 1,
            message: 'Xóa _license thành công', data: result
        });
    }).catch(err => {
        res.send({
            code: 0,
            message: 'Xóa _license thất bại', data: err
        });
    });
});

app.get('/get_all_licenses', function (req, res) {
    runSelectQuery(`SELECT * FROM Licenses`).then(result => {
        res.send({
            code: 1,
            message: 'Lấy danh sách _license thành công', data: result
        });
    }).catch(err => {
        res.send({
            code: 0,
            message: 'Lấy danh sách _license thất bại', data: err
        });
    });
});

app.post('/generate_license', celebrate({
    body: Joi.object({
        licenseDetail: Joi.object().required(),
        expiresIn: Joi.string().min(2).max(5).required()
    })
}), function (req, res) {
    var data = req.body;
    console.log(data);
    let generatedKey = '';
    generatedKey = jwt.sign(
        data.licenseDetail,
        privateKEY,
        {
            algorithm: "RS256",
            expiresIn: data.expiresIn ? data.expiresIn : '99y',
        })
    res.send({
        code: 1,
        message: 'Tạo licenseKey thành công',
        generatedKey: generatedKey
    }
    );
});

app.post('/verify_license', celebrate({
    body: Joi.object({
        licenseKey: Joi.string().min(10).max(5000).required()
    })
}), function (req, res) {
    let message = '';
    jwt.verify(req.body.licenseKey, publicKEY, function (err, decoded) {
        if (err) {
            console.log(err.name);
            if (err.name == 'TokenExpiredError')
                message = 'expired'
            else
                message = 'invalid'
        }
        else
            message = 'valid'
        res.send({
            code: 1,
            message: message
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


// Database Operations
async function initDB() {
    await runquery(`CREATE TABLE IF NOT EXISTS Customers
    (
      CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerName VARCHAR(200) NOT NULL UNIQUE,
      Status INT NOT NULL DEFAULT 1,
      Note TEXT DEFAULT NULL,
      Created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`);
    await runquery(`CREATE TABLE IF NOT EXISTS Licenses
    (
      LicenseID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerID INTEGER NOT NULL,
      Status INT NOT NULL DEFAULT 1,
      LicenseKey TEXT DEFAULT NULL,
      Created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(CustomerID) REFERENCES Customers(CustomerID) ON UPDATE CASCADE ON DELETE CASCADE
    );`);
    return Promise.resolve(true);
}
function runquery(sql, params = []) {
    // console.log(sql)
    return new Promise((resolve, reject) => {
        database.run(sql, params, function (err) {
            if (err) {   //Trường hợp lỗi
                console.log('Error running sql ' + sql)
                console.log(err)
                reject(err)
            } else {   //Trường hợp chạy query thành công
                resolve({ id: this.lastID })   //Trả về kết quả là một object có id lấy từ DB.
            }
        })
    })
}
function runSelectQuery(sql, params = []) {
    // console.log(sql)
    return new Promise((resolve, reject) => {
        database.all(sql, params, (error, row) => {
            if (error) {
                console.log('Error running sql ' + sql)
                reject(err)
            }
            else
                resolve(row);
        })
    })
}


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
        createDbConnection();
        initDB();
    }
})




