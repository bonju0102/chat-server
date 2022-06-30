const fs = require( "fs" );
const path = require( "path" );
const db = require( "./database" );

const modelAbsolutePath = path.join( __dirname, '../models/' );
let modelFiles = fs.readdirSync( modelAbsolutePath ).filter( ( filename ) => { return filename.endsWith( '.js' ) } );

for ( let model of modelFiles ) {
    console.log( `Import model from file: ${model}` );
    module.exports[ model.substring(0, model.length - 3) ] = require( modelAbsolutePath + model );
}

module.exports.Op = db.Sequelize.Op;
module.exports.mysql = db.mysql;