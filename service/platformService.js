const utils = require( "../utils/utils" );
const platformMgr = require( "../models/platform" );

const platformService = {}

platformService.getPlatform = async ( callback ) => {
    try {
        await platformMgr.getOriginal( async ( result ) => {
            let platforms = []
            for await ( let p of result ) {
                platforms.push({
                    "id": p._id.toString(),
                    "name": p.name,
                    "url": p.url,
                    "api_key": p.api_key,
                    "status": p.status,
                    "create_time": p.create_time,
                    "update_time": p.update_time,
                });
            }
            callback( platforms )
        })
    } catch ( e ) {
        console.error( e );
    }
}

platformService.createPlatform = async ( name, url = "" ) => {
    const api_key = utils.genAPIKey();
    return await platformMgr.push({
        "name": name,
        "url": url,
        "api_key": api_key,
    })
}

platformService.updatePlatform = async ( platform, callback ) => {
    try {
        await platformMgr.update( platform, ( err, res ) => {
            if ( err ) callback( err, {} );
            callback( err, res );
        })
    } catch ( e ) {
        console.error( e );
    }
}

platformService.deletePlatform = async ( platform_id, callback ) => {
    try {
        await platformMgr.remove( platform_id, ( err, res ) => {
            if ( err ) callback( err, {} );
            callback( err, res );
        })
    } catch ( e ) {
        console.error( e );
    }
}

module.exports = platformService