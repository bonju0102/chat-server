const { redis, pubRedis, subRedis } = require( "../public/redis" );

let instances = {};

class UserManager {
    constructor( platform_id, loadCb, addCb, removeCb ) {
        this.platform_id = platform_id;
        this.totalUsers = {};
        this.totalCount = 0;
        // Initial load
        this.load();

        // Subscribe channels
        this.subscribe( `totalUsers:${this.platform_id}`, ( message ) => {
            if ( message.length < 10 ) this.totalCount++
            else this.totalCount--
            this.load();
        });
        this.subscribe( `offline:${this.platform_id}`, ( message ) => {
            this.removeCb( message )
        });
        this.subscribe( `newConnection:${this.platform_id}`, ( message ) => {
            this.addCb( JSON.parse( message ) );
        });

        // 刷新/新增/刪除玩家列表後 callback
        this.loadCb = loadCb || function () {}
        this.addCb = addCb || function () {}
        this.removeCb = removeCb || function () {}
    }

    async load() {
        this.totalUsers = await redis.hgetall( `totalUsers:${this.platform_id}`, ( err, res ) => {
            for ( let key in res ) {
                res[ key ] = JSON.parse( res[ key ] )
            }
            return res
        });
        this.totalCount = Object.keys( this.totalUsers ).length;
        this.loadCb( this.totalUsers )
    }

    get() {
        return this.totalUsers
    }

    getOnlineCount() {
        return this.totalCount;
    }

    async addUser( socket_id, user_info ) {
        user_info.socket_id = socket_id;
        await redis.hset( `totalUsers:${this.platform_id}`, { [`${user_info.uid}`]: JSON.stringify( user_info ) }, () => {
            user_info.socket_id = socket_id;
            pubRedis.publish( `totalUsers:${this.platform_id}`, JSON.stringify( user_info ) );
            pubRedis.publish( `newConnection:${this.platform_id}`, JSON.stringify( user_info ) );
        });
    }

    removeUser( socket_id, user_info ) {
        redis.hdel( `totalUsers:${this.platform_id}`, user_info.uid, () => {
            this.totalCount--;
            pubRedis.publish( `totalUsers:${this.platform_id}`, socket_id );
            pubRedis.publish( `offline:${this.platform_id}`, socket_id );
        })
    }

    // 訂閱
    subscribe( channel, action ) {
        subRedis.subscribe( channel, ( err, msg ) => {
            if ( err ) {
                console.error( err.message );
            } else {
                console.log( `Subscribe to \"${channel}\"`)
                this.onSubscribe( channel, action );
            }
        });
    }

    // 刷新
    onSubscribe( channel, action ) {
        subRedis.on( "message", ( subsChannel, message ) => {
            if ( subsChannel === channel ) {
                action( message );
            }
        });
    }
}

module.exports = ( platform_id, loadCb, addCb, removeCb ) => {
    if ( !instances[ platform_id ] ) {
        instances[ platform_id ] = new UserManager( platform_id, loadCb, addCb, removeCb )
    }
    return instances[ platform_id ]
}