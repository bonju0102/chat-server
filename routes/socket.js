module.exports = ( app ) => {
    const config = require( `../config/${process.env.NODE_ENV}_config.js` );
    const middleware = require( "../middleware/middleware" );
    const { createServer } = require( "http" );
    const { Server } = require( "socket.io" );
    const httpServer = createServer( app );
    const Records = require( "../models/record" );
    const RoomManager = require( "../models/room" );

    //跨域 "*" => 全通
    const io = new Server( httpServer, {
        cors: {
            origin: "*"
        }
    });

    // express can use io with req.app.get('io')
    app.set( 'io', io );

    io.use( middleware );

    // Get notify after msg saved
    const records = new Records( ( msg ) => {
        // Send msg to specific room to all clients
        io.sockets.to( msg.room_id ).emit( "msg", msg );
    });

    const roomMgr = new RoomManager( ( rooms ) => {
        totalRooms = roomMgr.get();
        io.emit( 'refresh-rooms', rooms );
    })

    let onlineCount = 0;
    let totalUsers = {};
    let totalRooms = roomMgr.get();
    io.on( 'connection', ( socket ) => {
        console.log( `Socket ${socket.id} connected.` );
        console.log( socket.decoded_token );

        // records.on( "new_message", ( msg ) => {
        //     // Send msg to specific room to all clients
        //     io.sockets.to( msg.room_id ).emit( "msg", msg );
        // })
        let room_id = socket.id;
        let user_name = socket.decoded_token ? socket.decoded_token.user_name : `guest_${new Date().getTime()}`;
        onlineCount++;

        // Notify to all clients current connection number
        io.emit( 'onlineCount', onlineCount );

        // Notify to all clients the socket id is online
        io.emit( "new-connection", user_name, socket.id );

        // Notify current db total room list
        socket.emit( "totalRooms", totalRooms[ socket.decoded_token.platform_id ] );
        // RoomMgr.getByPlatformId( socket.decoded_token.platform_id, ( res ) => {
        //     for ( let room of res ) {
        //         let tmp_id = `${room.platform_id}_${room.room_id}`;
        //         if ( Object.keys( totalRooms ).indexOf( tmp_id ) == -1 ) {
        //             totalRooms[ tmp_id ] = room.name;
        //         }
        //     }
        //     socket.emit( "totalRooms", totalRooms );
        //     console.log( '---- totalRooms ----')
        //     console.log( totalRooms );
        //     console.log( '---- RoomMgr.get() ----')
        //     console.log( RoomMgr.get() );
        // })

        // Notify current socket id total room list
        totalUsers[ socket.id ] = user_name;
        socket.emit( "totalUsers", totalUsers );

        // DEBUG USE: get current & total room list
        socket.on( "rooms", () => {
            console.log( `Total rooms:` );
            console.log( io.sockets.adapter.rooms );
            console.log( `My rooms:` );
            console.log( socket.rooms );
        });

        // Notify sender the maxRecord for msg
        socket.emit( "maxRecord", records.getMax() );

        // Load message record for current room_id
        records.get( room_id, ( msg ) => {
            // Notify sender current room chat record
            socket.to( msg.room_id ).emit( "chatRecord", msg );
        })

        // Websocket disconnect
        socket.on( 'disconnect', () => {
            console.log( 'Bye socket~' );
            delete totalUsers[ socket.id ];
            // Update onlineCount
            onlineCount = onlineCount < 0 ? 0 : onlineCount -= 1;
            io.emit( 'onlineCount', onlineCount );
            // Notify to all clients the socket id is offline
            io.emit( 'offline', socket.id );
        })

        // Get notify when msg sent
        socket.on( 'send', ( msg ) => {
            if ( Object.keys( msg ).length < 2 ) return;
            console.log( msg );
            records.push( msg );
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
            for ( let r of totalRooms[ socket.decoded_token.platform_id ] ) {
                if ( room_id == `${r.platform_id}_${r.room_id}` ) {
                    records.setMax( r.history_limit );
                    socket.emit( "maxRecord", r.history_limit );
                }

            }
            // Load message record for current (new) room
            records.get( room, ( msg ) => {
                socket.emit( "chatRecord", msg );
            })
            // io.sockets.to( room ).emit( 'room-brodcast', `${socket.id} has join in ${room}`);
        })

        // socket.on( 'room-brodcast', ( data ) => {
        //     console.log( `room brodcast: ${data}` );
        // })

        // module.exports.socket = socket;
    })

    httpServer.listen( config.SOCKET_PORT, () => {
        console.log( `Socket.io is running port ${config.SOCKET_PORT}`);
    })
}