const db = require( "../public/database" );
const schema = require( "../schema/Room" );
const {subRedis, pubRedis} = require("../public/redis");
const Room = db.model( "Room", schema );

let instance;

class RoomManager {
    constructor( callback ) {
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
        const r = new Room( room_info );
        let room = await r.save();
        pubRedis.publish( "new_room", `${room._id}` );
        return room;
    }

    get( platform_id ) {
        return platform_id ? this.totalRooms[ platform_id ] ? this.totalRooms[ platform_id ] : {} : this.totalRooms
    }

    getOriginal( callback ) {
        Room.find().sort( { "platform_id": 1, "room_id": 1 } ).then( ( res ) => {
            callback( res );
        });
    }

    getByPlatformId( platform_id, callback ) {
        Room.find( { "platform_id": platform_id } ).then( ( res ) => {
            callback( res );
        });
    }

    update( room_info, callback ) {
        Room.findOneAndUpdate( { "_id": room_info.id }, room_info, { new: true }, ( err, res ) => {
            if ( err ) {
                console.error( err );
                callback( err, {} );
            }
            pubRedis.publish( "update_room", `${res._id}` );
            callback( err, res );
        })
    }

    remove( id, callback ) {
        Room.findOneAndDelete( { "_id": id }, { rawResult: true }, ( err, res ) => {
            if ( err ) {
                console.error( err );
                callback( err, {} );
            }
            pubRedis.publish( "delete_room", `${res.value._id.toString()}` );
            callback( err, res );
        })
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