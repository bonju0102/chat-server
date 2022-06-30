const config = require( `../config/${process.env.NODE_ENV}_config.js` );
const moment = require( "moment" );
const { Sequelize } = require( "sequelize" );
const mysql = new Sequelize( config.mysqlConfig );

Sequelize.defineModel = function ( model_name, attributes ) {
    let attrs = {};
    for ( let key in attributes ) {
        let value = attributes[ key ];
        if ( typeof value === "object" && value[ "type" ] ) {
            value.allowNull = value.allowNull || false;
            attrs[ key ] = value;
        } else {
            attrs[ key ] = {
                type: value,
                allowNull: false
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
        defaultValue: Sequelize.NOW,
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

    return mysql.define( model_name, attrs, {
        tableName: model_name,
        timestamps: false,
        hooks: {
            beforeUpdate( instance, options) {
                instance.dataValues.update_time = moment( Date.now() ).format( 'YYYY-MM-DD HH:mm:ss' )
            }
        }
    })
}


module.exports = { Sequelize, mysql };
