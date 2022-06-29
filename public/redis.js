const ioredis = require( "ioredis" );
const config = require( `../config/${process.env.NODE_ENV}_config.js` );

const options = {
    host: config.redisConfig.host,
    port: config.redisConfig.port,
    password: config.redisConfig.password,
    detect_buffers: true,
    retry_strategy: function (options) {
        // 重新連線機制
        if (options.error && options.error.code === "ECONNREFUSED") {
            console.log("連線被拒絕")
            return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // 在指定的时间限制后结束重新连接
            return new Error("Retry time exhausted");
        }
        if (options.attempt > 10) {
            // / 以内置错误结束重新连接
            return undefined;
        }
        // 重新连接后
        return Math.min(options.attempt * 100, 3000);
    }
}


const redis = ioredis.createClient(options)
// PubSub 需要獨立使用 redis 接口
const pubRedis = ioredis.createClient(options)
const subRedis = ioredis.createClient(options)


module.exports = { redis, pubRedis, subRedis }