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
            pubRedis.publish( "new_platform", `${res.dataValues.id}` );
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
            .then( res => callback( res ) )
            .catch( ( err ) => {
                console.error( err );
                callback( err )
            });
    }

    remove( platform_id, callback ) {
        Platform.findByPk( platform_id )
            .then( platform => platform.destroy() )
            .then( res => callback( res ) )
            .catch( ( err ) => {
                console.error( err );
                callback( err )
            });
    }

    onSubscribe() {
        // 新增
        subRedis.subscribe( "new_platform", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
        });
        // 更新
        subRedis.subscribe( "update_platform", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
        });
        // 刪除
        subRedis.subscribe( "delete_platform", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
        });
        // 刷新
        subRedis.on( "message", ( channel, message ) => {
            if ( [ "new_platform", "update_platform", "delete_platform" ].indexOf( channel ) != -1 ) {
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
