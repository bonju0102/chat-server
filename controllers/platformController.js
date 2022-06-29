const utils = require( "../utils/utils" );
const ERR = require( "../utils/errCode" );
const platformService = require( "../service/platformService" );

exports.getPlatform = async ( req, res ) => {
    await platformService.getPlatform( ( result ) => {
        res.json({
            "code": 200,
            "data": result
        })
    });
}

exports.createPlatform = async ( req, res ) => {
    const result = await platformService.createPlatform( req.body.name, req.body.url );
    res.json({
        "code": 200,
        "data": result
    })
}

exports.updatePlatform = async ( req, res ) => {
    await platformService.updatePlatform( req.body, ( error, result ) => {
        // Kick all users on the platform_id
        if ( result.status === 0 ) {
            req.app.get( 'io' ).emit( 'kick', result._id );
        }
        res.json({
            "code": 200,
            "data": result
        })
    });
}

exports.deletePlatform = async ( req, res ) => {
    await platformService.deletePlatform( req.params.id, ( error, result ) => {
        res.json({
            "code": 200,
            "data": result
        })
    });
}