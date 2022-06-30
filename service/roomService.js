const utils = require( "../utils/utils" );
const RoomManager = require("../managers/roomManager");

const roomService = {}
const roomMgr = new RoomManager();

roomService.getRoom = async () => {
    try {
        return await roomMgr.getOriginal()
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
        await roomMgr.update( room, res => callback( res ) )
    } catch ( e ) {
        console.error( e );
    }
}

roomService.deleteRoom = async ( id, callback ) => {
    try {
        await roomMgr.remove( id, res => callback( res ) )
    } catch ( e ) {
        console.error( e );
    }
}


module.exports = roomService