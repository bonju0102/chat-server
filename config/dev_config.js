exports.mysqlConfig = {
    "username": "root",
    "password": "c7Qz4BLKEoq@hE?T",
    "database": "chat",
    "host": "localhost",
    "port": "3306",
    "dialect": "mysql",
    "timezone":"+08:00", //設置 UTC+8
    "logQueryParameters": true, // 完整SQL語句Log
    logging: console.log
}

exports.redisConfig = {
    "host": "localhost",
    "port": "6379",
    "password": "a168168168"
}

exports.PORT = 8888;

exports.SOCKET_PORT = 9999;

exports.TZ = 'Asia/Taipei';

exports.SECRET = "44ba1e74c787c24a8366c3778ebe717a3a707545b2dbfc0c365429ad201d122f";

exports.backendUrl = `http://localhost:${this.PORT}/`;