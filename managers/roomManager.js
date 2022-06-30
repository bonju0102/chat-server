const models = require( "../public/modelPool" );
const Room = models.Room;
const { pubRedis, subRedis } = require( "../public/redis" );

let instance;

class RoomManager {
    constructor( callback ) {
        Room.sync();
        this.rooms = {};
        this.totalRooms = {};
        this.load();
        this.onSubscribe();
        this.callback = callback || function () {}
    }

    load() {
        this.getOriginal( ( rooms ) => {
            this.totalRooms = {}
            for ( let r of rooms ) {
                if ( !this.totalRooms[ r.platform_id ] ) {
                    this.totalRooms[r.platform_id] = []
                }
                // this.totalRooms[ r.platform_id ][ `${r.platform_id}_${r.room_id}` ] = r.name
                this.totalRooms[ r.platform_id ].push( r );
            }
            this.callback( this.totalRooms );
        });
    }

    async push( room_info ) {
        return await Room.create( room_info ).then( res => {
            pubRedis.publish( "new_room", `${res.dataValues.id}` );
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
            .then( res => callback( res ) )
            .catch( ( err ) => {
                console.error( err );
                callback( err )
            });
    }

    remove( id, callback ) {
        Room.findByPk( id )
            .then( room => room.destroy() )
            .then( res => callback( res ) )
            .catch( ( err ) => {
                console.error( err );
                callback( err )
            });
    }

    onSubscribe() {
        // 新增
        subRedis.subscribe( "new_room", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
        });
        // 更新
        subRedis.subscribe( "update_room", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
        });
        // 刪除
        subRedis.subscribe( "delete_room", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
        });
        // 刷新
        subRedis.on( "message", ( channel, message ) => {
            if ( [ "new_room", "update_room", "delete_room" ].indexOf( channel ) != -1 ) {
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
