// const { EventEmitter } = require( "events" );
const mongo = require( "../public/database" );
const schema = require( "../schema/Message" );
const Message = mongo.model( "Message", schema );
const WordFilter = require( "bad-words-chinese" );
const wordFilter = new WordFilter();
const { pubRedis, subRedis } = require( "../public/redis" );

let MAX = 20;

// class Records extends EventEmitter {
class Records {
    constructor( callback ) {
        this.onSubscribe();
        this.callback = callback || function ( msg ) { console.log( msg ) }
    }

    push( msg ) {
        const m = new Message( msg );
        m.save();

        // this.emit( "new_message", this.cleanWord( new Array( msg ) )[0] );
        pubRedis.publish( "new_message", JSON.stringify( this.cleanWord( new Array( msg ) )[0] ) );

        // Message.count().then( ( count ) => {
        //    if ( count >= MAX ) {
        //        Message.find().sort( { "time": 1 } ).limit( 1 ).then( ( res ) => {
        //            Message.findByIdAndDelete( res[0]._id, ( err, deleted ) => {
        //                if ( err ) {
        //                    console.log( `DB Error: ${err}` );
        //                }
        //                if ( !deleted ) {
        //                    console.log(deleted);
        //                }
        //            });
        //        })
        //    }
        // });
    }

    get( room_id, callback ) {
        Message.count().then( ( count ) => {
            if ( count >= MAX ) {
                Message.find( { "room_id": room_id } ).sort( { "time": 1 } ).limit( MAX ).then( ( res ) => {
                    callback( this.cleanWord( res ) );
                });
            } else {
                Message.find( { "room_id": room_id } ).sort( { "time": 1 } ).then( ( res ) => {
                    callback( this.cleanWord( res ) );
                });
            }
        })
    }

    setMax( max ) {
        MAX = max;
    }

    getMax() {
        return MAX;
    }

    cleanWord( msgs ) {
        const chinese_bad_word = [ '幹' ];
        wordFilter.chineseList.push( ...chinese_bad_word );
        for ( let msg of msgs ) {
            msg.msg = wordFilter.clean( msg.msg );
        }
        return msgs
    }

    onSubscribe() {
        // 更新
        subRedis.subscribe( "new_message", ( err, msg ) => {
            if ( err ) {
                console.log( err.message );
            }
            subRedis.on( "message", ( channel, message ) => {
                if ( channel == "new_message" ) {
                    const msg = JSON.parse( message );
                    this.callback( msg );
                }
            });
        });
    }

}

module.exports = Records;
// module.exports = ( () => {
//     if ( !instance ) {
//         instance = new Records();
//     }
//     return instance;
// })()