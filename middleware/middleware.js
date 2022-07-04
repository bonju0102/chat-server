const ERR = require( "../utils/errCode" );
const utils = require( "../utils/utils" );
const PlatformMgr = require( "../managers/platformManager")

module.exports = ( socket, next ) => {
    const token = socket.handshake.auth.token;
    if ( !token ) {
        console.log( `Connection not authorized` );
        next( ERR.NOT_AUTH );
    }

    const data = utils.verifyToken( token );
    if ( !data ) {
        console.log( `Signature failed` );
        next( ERR.TOKEN_ERROR );
    }

    PlatformMgr.getById( data.platform_id, ( res ) => {
        if ( !res || res.status === 0 ) {
            console.log( `Platform suspended!` );
            next( ERR.PLATFORM_SUSPEND );
        }
    })

    // Save token info in decoded_token
    socket.decoded_token = data;

    next();
}