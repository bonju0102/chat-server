const models = require( "../public/modelPool" );
const Message = models.Message;
const WordFilter = require( "bad-words-chinese" );
const wordFilter = new WordFilter();
const { pubRedis, subRedis } = require( "../public/redis" );

// let instance;
let MAX = 20;

class Records {
    constructor( callback ) {
        Message.sync();
        this.onSubscribe();
        // 載入訊息後 callback
        this.callback = callback || function ( msg ) { console.log( msg ) }
    }

    push( msg ) {
        Message.create( msg )
            .then( res => {
                pubRedis.publish( "new_message", JSON.stringify( this.cleanWord( new Array( msg ) )[0] ) )
            })
    }

    get( room_id, callback ) {
        Message.count().then( count => {
            if ( count >= MAX ) {
                Message.findAll({
                    where: {
                        room_id: room_id
                    },
                    order: [
                       [ 'id', 'DESC' ]
                    ],
                    limit: MAX,
                }).then( res => {
                    res = res.sort( ( a, b ) => { return a > b ? 1 : -1 } );
                    callback( this.cleanWord( res ) );
                });
            } else {
                Message.findAll({
                    where: {
                        room_id: room_id
                    },
                    order: [
                        [ 'id', 'ASC' ]
                    ],
                }).then( res => callback( this.cleanWord( res ) ) );
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
                if ( channel === "new_message" ) {
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
