const config = require( `../config/${process.env.NODE_ENV}_config.js` );
const mongoose = require( "mongoose" );
const mongo = mongoose.createConnection( config.mongoURI, config.mongoConfig );
const { Sequelize } = require( "sequelize" );
const mysql = new Sequelize( config.mysqlConfig );

mongo.on( "error", console.error.bind( console, "connection error: "));
mongo.on( "open", () => { console.log( "mongo connected!" ) });

mysql.defineModel = function ( name, attributes ) {
    let attrs = {};
    for ( let key in attributes ) {
        let value = attributes[ key ];
        if ( typeof value === "object" && value[ "type" ] ) {
            value.allowNull = value.allowNull || true;
            attrs[ key ] = value;
        } else {
            attrs[ key ] = {
                type: value,
                allowNull: true
            };
        }
    }

    attrs.id = {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    };

    attrs.create_time = {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "建立時間",
        get() {
            return moment(this.getDataValue("create_time")).format('YYYY-MM-DD HH:mm:ss');
        }
    };

    attrs.update_time = {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "更新時間",
        get() {
            return moment(this.getDataValue("update_time")).format('YYYY-MM-DD HH:mm:ss');
        }
    };
}


module.exports = mongo;
