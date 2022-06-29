const jwt = require( "jsonwebtoken" );
const crypto = require( "crypto" );
const moment = require( "moment" );
const config = require( `../config/${process.env.NODE_ENV}_config.js` );

exports.genAPIKey = function () {
    return crypto.randomBytes( 32 ).toString( 'hex' )
}

exports.createToken = function ( data, expiresIn = "30m" ) {
    return jwt.sign( data, config.SECRET, { expiresIn: expiresIn } )
}

exports.decodeToken = function ( token ) {
    return jwt.decode( token, {} )
}

exports.verifyToken = function ( token ) {
    try {
        return jwt.verify( token, config.SECRET, {} )
    } catch ( err ) {
        console.log( err );
        return false
    }
}
