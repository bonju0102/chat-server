const utils = require( "../utils/utils" );
const ERR = require( "../utils/errCode" );
const roomService = require( "../service/roomService" );

exports.getRoom = async ( req, res ) => {
    await roomService.getRoom( ( result ) => {
        res.json({
            "code": 200,
            "data": result
        })
    });
}

exports.createRoom = async ( req, res ) => {
    const result = await roomService.createRoom(
        req.body.platform_id,
        req.body.room_id,
        req.body.name,
        req.body.history_limit
    );
    res.json({
        "code": 200,
        "data": result
    })
}

exports.updateRoom = async ( req, res ) => {
    await roomService.updateRoom( req.body, ( error, result ) => {
        res.json({
            "code": 200,
            "data": result
        })
    });
}

exports.deleteRoom = async ( req, res ) => {
    await roomService.deleteRoom( req.params.id, ( error, result ) => {
        res.json({
            "code": 200,
            "data": result
        })
    });
}