const db = require( "../public/database" );
const schema = require( "../schema/Platform" );
const Platform = db.model( "Platform", schema );
const { pubRedis, subRedis } = require( "../public/redis" );

let instance;

class PlatformManager {
    constructor() {
        this.platforms = {};
        this.load();
        this.onSubscribe();
    }

    load() {
        this.getOriginal( ( platforms ) => {
            for ( let p of platforms ) {
                this.platforms[ p._id.toString() ] = p
            }
        });
    }

    async push( platform_info ) {
        const p = new Platform( platform_info );
        let platform = await p.save();
        pubRedis.publish( "new_platform", `${p._id}` );
        return platform;
    }

    get() {
        return this.platforms
    }

    getOriginal( callback ) {
        Platform.find().sort( { "_id": 1 } ).then( ( res ) => {
            callback( res );
        });
    }

    getById( id, callback ) {
        Platform.findById( id ).then( ( res ) => {
            callback( res );
        });
    }

    update( platform_info, callback ) {
        Platform.findOneAndUpdate( { "_id": platform_info.id }, platform_info, { new: true }, ( err, res ) => {
            if ( err ) {
                console.error( err );
                callback( err, {} );
            }
            pubRedis.publish( "update_platform", `${res._id}` );
            callback( err, res );
        })
    }

    remove( platform_id, callback ) {
        Platform.findOneAndDelete( { "_id": platform_id }, { rawResult: true }, ( err, res ) => {
            if ( err ) {
                console.error( err );
                callback( err, {} );
            }
            pubRedis.publish( "delete_platform", `${res.value._id}` );
            callback( err, res );
        })
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
})()