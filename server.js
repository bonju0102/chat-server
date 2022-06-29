const express = require( "express" );
const cors = require( "cors" );
const config = require( `./config/${process.env.NODE_ENV}_config.js` );
const app = express();

// CORS
app.use( cors() );

// parse requests of content-type - application/json
app.use( express.json() );

// parse requests of content-type - application/x-www-form-urlencoded
app.use( express.urlencoded({ extended: true }));

// 引入 socket
require( "./routes/socket" )( app );

// 引入 routes
require( "./routes/routes" )( app );

app.listen( config.PORT, () => {
    console.log( `API server is running port ${config.PORT}`);
})

