const models = require( "../public/modelPool" );
const Room = models.Room;
const { pubRedis, subRedis } = require( "../public/redis" );

// let instance;

class RoomManager {
    constructor( callback ) {
        Room.sync();
        this.totalRooms = {};
        this.load();
        this.onSubscribe();
        // 載入/刷新房間後 callback
        this.callback = callback || function () {}
    }

    load() {
        this.getOriginal( ( rooms ) => {
            this.totalRooms = {}
            for ( let r of rooms ) {
                if ( !this.totalRooms[ r.platform_id ] ) {
                    this.totalRooms[r.platform_id] = []
                }
                this.totalRooms[ r.platform_id ].push( r );
            }
            this.callback( this.totalRooms );
        });
    }

    async push( room_info ) {
        return await Room.create( room_info ).then( res => {
            pubRedis.publish( "room", `${res.dataValues.id}` );
            return res
        })
    }

    get( platform_id ) {
        return platform_id ? this.totalRooms[ platform_id ] ? this.totalRooms[ platform_id ] : {} : this.totalRooms
    }

    async getOriginal( callback ) {
        return await Room.findAll( { raw: true } ).then( res => callback ? callback( res ) : res )
    }

    getByPlatformId( platform_id, callback ) {
        return Room.findAll( { where: { "platform_id": platform_id } } )
            .then( res => callback ? callback( res ) : res )
    }

    update( room_info, callback ) {
        Room.findByPk( room_info.id )
            .then( room => room.update( room_info ) )
            .then( res => {
                pubRedis.publish( "room", `${res.dataValues.id}` );
                callback(res)
            })
            .catch( ( err ) => {
                console.error( err );
                callback( err )
            });
    }

    remove( id, callback ) {
        Room.findByPk( id )
            .then( room => room.destroy() )
            .then( res => {
                pubRedis.publish( "room", `${res.dataValues.id}` );
                callback(res)
            })
            .catch( ( err ) => {
                console.error( err );
                callback( err )
            });
    }

    onSubscribe() {
        // 訂閱
        subRedis.subscribe( "room", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
        });
        // 刷新
        subRedis.on( "message", ( channel, message ) => {
            if ( channel === "room" ) {
                this.load();
            }
        });
    }
}

module.exports = RoomManager;
// module.exports = ( () => {
//     if ( !instance ) {
//         instance = new RoomManager();
//     }
//     return instance;
// })()
