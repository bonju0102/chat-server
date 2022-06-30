const utils = require( "../utils/utils" );
const platformMgr = require( "../managers/platformManager" );

const platformService = {}

platformService.getPlatform = async () => {
    try {
        return await platformMgr.getOriginal();
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
        await platformMgr.update( platform, res => callback( res ) );
    } catch ( e ) {
        console.error( e );
    }
}

platformService.deletePlatform = async ( platform_id, callback ) => {
    try {
        await platformMgr.remove( platform_id, ( res ) => callback( res ) )
    } catch ( e ) {
        console.error( e );
    }
}

module.exports = platformService