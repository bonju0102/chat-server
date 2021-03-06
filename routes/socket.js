module.exports = ( app ) => {
    const config = require( `../config/${process.env.NODE_ENV}_config.js` );
    const middleware = require( "../middleware/middleware" );
    const { pubRedis, subRedis } = require( "../public/redis" );
    const { createServer } = require( "http" );
    const { Server } = require( "socket.io" );
    const { createAdapter } = require( "@socket.io/redis-adapter" );
    const httpServer = createServer( app );
    const RecordsManager = require( "../managers/recordManager" );
    const RoomManager = require( "../managers/roomManager" );
    const HeartBeat = require( "../public/heartBeat" );

    //跨域 "*" => 全通
    // Redis adapter was implemented with pub/sub feature of Redis
    const redis_adapter = createAdapter( pubRedis, subRedis );
    const io = new Server( httpServer, {
        cors: {
            origin: "*"
        },
        adapter: redis_adapter,
    });

    // express can use io with req.app.get('io')
    app.set( 'io', io );

    io.use( middleware );

    // Get notify after msg saved
    const recordsMgr = new RecordsManager( ( msg ) => {
        // Send msg to specific room to all clients
        io.sockets.to( msg.room_id ).emit( "msg", msg );
    });

    // Get notify after room create/update/remove
    const roomMgr = new RoomManager( ( rooms ) => {
        totalRooms = roomMgr.get();
        io.emit( 'refresh-rooms', rooms );
    })

    let totalRooms = roomMgr.get();
    io.on( 'connection', async ( socket ) => {
        console.log( `Socket ${socket.id} connected.` );
        console.log( socket.decoded_token );

        // Heart beat
        const heartBeat = new HeartBeat( 5 * 1000, socket )
        socket.on( 'heart-beat', ( msg ) => {
            if ( msg === "ping" ) {
                socket.emit( 'heart-beat', "pong" );
            }
            if ( msg === "pong" ) {
                // client is alive
                heartBeat.reset();
            }
        })

        // Get notify after user connect/disconnect
        const userMgr = require( "../managers/userManager" )( socket.decoded_token.platform_id, ( users ) => {
            // Notify to all clients current total connected socket id(user) list
            io.emit( 'totalUsers', users );
            // Notify to all clients current connection number
            io.emit( 'onlineCount', userMgr.getOnlineCount() );
        }, ( user_info ) => {
            // Prevent same user login from different socket(instance)
            io.emit( "new-connection", user_info);
        }, ( socket_id ) => {
            // Notify to all clients the socket_id is offline
            io.emit( "offline", socket_id );
        })

        let room_id = socket.id;
        let user_id = socket.decoded_token ? socket.decoded_token.uid : `0_guest${new Date().getTime()}`;
        let user_name = socket.decoded_token ? socket.decoded_token.user_name : `0_guest${new Date().getTime()}`;

        await userMgr.addUser( socket.id, socket.decoded_token );

        // Notify current db total room list
        socket.emit( "totalRooms", totalRooms[ socket.decoded_token.platform_id ] ? totalRooms[ socket.decoded_token.platform_id ] : [] );

        // DEBUG USE: get current & total room list
        socket.on( "rooms", () => {
            console.log( `Total rooms:` );
            console.log( io.sockets.adapter.rooms );
            console.log( `My rooms:` );
            console.log( socket.rooms );
        });

        // Notify sender the maxRecord for msg
        socket.emit( "maxRecord", recordsMgr.getMax() );

        // Load message record for current room_id
        recordsMgr.get( room_id, ( msg ) => {
            // Notify sender current room chat record
            socket.to( msg.room_id ).emit( "chatRecord", msg );
        })

        // Websocket disconnect
        socket.on( 'disconnect', () => {
            console.log( 'Bye socket~' );

            userMgr.removeUser( socket.id, socket.decoded_token );
            // Update onlineCount
            io.emit( 'onlineCount', userMgr.getOnlineCount() );
        })

        // Get notify when msg sent
        socket.on( 'send', ( msg ) => {
            if ( Object.keys( msg ).length < 2 ) return;
            console.log( msg );
            recordsMgr.push( msg );
            // Send msg through adapter
            io.to( msg.room_id ).emit( "msg", recordsMgr.cleanWord( new Array( msg ) )[0] );
        })

        // Get notify when client want to join specific room
        socket.on( 'join', ( room ) => {
            socket.join( room );
            // Leave previous room except own socket_id
            if ( room_id != socket.id ) {
                socket.leave( room_id );
            }
            room_id = room;
            // Notify sender join room success
            socket.emit( 'onJoinRoom', room );
            for ( let r of totalRooms[ socket.decoded_token.platform_id ] ? totalRooms[ socket.decoded_token.platform_id ] : [] ) {
                if ( room_id == `${r.platform_id}_${r.room_id}` ) {
                    recordsMgr.setMax( r.history_limit );
                    socket.emit( "maxRecord", r.history_limit );
                }

            }
            // Load message record for current (new) room
            recordsMgr.get( room, ( msg ) => {
                socket.emit( "chatRecord", msg );
            })
            // io.sockets.to( room ).emit( 'room-brodcast', `${socket.id} has join in ${room}`);
        })

        socket.on( "userFocus", ( msg ) => {
            if ( msg ) console.log( "user is focus on the screen." )
            else console.log( "user leave on the page." )
        })

        // module.exports.socket = socket;
    })

    httpServer.listen( config.SOCKET_PORT, () => {
        console.log( `Socket.io is running port ${config.SOCKET_PORT}`);
    })
}