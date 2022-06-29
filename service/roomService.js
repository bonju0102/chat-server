const utils = require( "../utils/utils" );
const RoomManager = require("../models/room");

const roomService = {}
const roomMgr = new RoomManager();

roomService.getRoom = async ( callback ) => {
    try {
        await roomMgr.getOriginal( async ( result ) => {
            let rooms = []
            for await ( let r of result ) {
                rooms.push({
                    "id": r._id.toString(),
                    "platform_id": r.platform_id,
                    "room_id": r.room_id,
                    "name": r.name,
                    "history_limit": r.history_limit,
                    "create_time": r.create_time,
                    "update_time": r.update_time,
                });
            }
            callback( rooms )
        })
    } catch ( e ) {
        console.error( e );
    }
}

roomService.createRoom = async ( platform_id, room_id, room_name, history_limit = 20 ) => {
    return await roomMgr.push({
        "platform_id": platform_id,
        "room_id": room_id,
        "name": room_name,
        "history_limit": history_limit,
    })
}

roomService.updateRoom = async ( room, callback ) => {
    try {
        await roomMgr.update( room, ( err, res ) => {
            if ( err ) callback( err, {} );
            callback( err, res );
        })
    } catch ( e ) {
        console.error( e );
    }
}

roomService.deleteRoom = async ( id, callback ) => {
    try {
        await roomMgr.remove( id, ( err, res ) => {
            if ( err ) callback( err, {} );
            callback( err, res );
        })
    } catch ( e ) {
        console.error( e );
    }
}


module.exports = roomService