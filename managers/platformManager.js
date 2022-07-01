const models = require( "../public/modelPool" );
const Platform = models.Platform;
const { pubRedis, subRedis } = require( "../public/redis" );

let instance;

class PlatformManager {
    constructor() {
        Platform.sync();
        this.platforms = {};
        this.load();
        this.onSubscribe();
    }

    load() {
        this.getOriginal( ( platforms ) => {
            for ( let p of platforms ) {
                this.platforms[ p.dataValues.id.toString() ] = p
            }
        });
    }

    async push( platform_info ) {
        return await Platform.create( platform_info ).then( res => {
            pubRedis.publish( "platform", `${res.dataValues.id}` );
            return res
        } );
    }

    get() {
        return this.platforms
    }

    async getOriginal( callback ) {
        return await Platform.findAll().then( res => callback ? callback( res ) : res );
    }

    getById( id, callback ) {
        return Platform.findByPk( id ).then(res => callback( res ) );
    }

    update( platform_info, callback ) {
        Platform.findByPk( platform_info.id )
            .then( platform => platform.update( platform_info ) )
            .then( res => {
                pubRedis.publish( "platform", `${res.dataValues.id}` );
                callback(res)
            })
            .catch( ( err ) => {
                console.error( err );
                callback( err )
            });
    }

    remove( platform_id, callback ) {
        Platform.findByPk( platform_id )
            .then( platform => platform.destroy() )
            .then( res => {
                pubRedis.publish( "platform", `${res.dataValues.id}` );
                callback(res)
            })
            .catch( ( err ) => {
                console.error( err );
                callback( err )
            });
    }

    onSubscribe() {
        // 訂閱
        subRedis.subscribe( "platform", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
        });
        // 刷新
        subRedis.on( "message", ( channel, message ) => {
            if ( channel === "platform" ) {
                this.load();
            }
        });
    }
}

module.exports = ( () => {
    if ( !instance ) {
        instance = new PlatformManager();
    }
    return instance;
})();
