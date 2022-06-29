const roomController = require("../controllers/roomController");
module.exports = ( app ) => {
    const path = require( "path" );
    const router = require( "express" ).Router();
    require( "express-group-routes" );

    // Controllers
    const apiController = require( "../controllers/apiController" );
    const platformController = require( "../controllers/platformController" );
    const roomController = require( "../controllers/roomController" );

    router.group( "/", ( router ) => {
        router.get('/socket1', ( req, res ) => {
            res.sendFile( path.join( __dirname, '../socket1.html' ) );
        })
        router.get('/socket2', ( req, res ) => {
            res.sendFile( path.join( __dirname, '../socket2.html' ) );
        })
    });

    router.group( "/auth", ( router ) => {
        router.post( "/getToken", apiController.getToken );
    });

    router.group( "/api", ( router ) => {
        // Utility
        router.post( "/kick/:uid", apiController.kickUser );

        // Platform
        router.group( "/platform", ( router ) => {
            router.get( "/", platformController.getPlatform );
            router.post( "/", platformController.createPlatform );
            router.put( "/", platformController.updatePlatform );
            router.delete( "/:id", platformController.deletePlatform );
        })

        // Room
        router.group( "/room", ( router ) => {
            router.get( "/", roomController.getRoom );
            router.post( "/", roomController.createRoom );
            router.put( "/", roomController.updateRoom );
            router.delete( "/:id", roomController.deleteRoom );
        })
    });

    app.use( "/", router );
};