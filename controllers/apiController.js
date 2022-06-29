const utils = require( "../utils/utils" );
const ERR = require( "../utils/errCode" );
const apiService = require( "../service/apiService" );

exports.getToken = ( req, res ) => {
    const token = utils.createToken( {
        "uid": req.body.uid,
        "user_name": req.body.user_name,
        "platform_id": req.body.platform_id,
    }, "24h" );
    res.json({
        "code": 200,
        "data": token
    })
}

exports.kickUser = ( req, res ) => {
    req.app.get( 'io' ).emit( 'kick', req.params.uid );
    res.json({
        "code": 200,
        "data": `${req.params.uid} is kicked!`
    })
}
