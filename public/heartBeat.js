class HeartBeat {
    constructor( timeout, socket ) {
        this.tiktok = null;
        this.dead = null
        this.timeout = timeout || 60 * 1000;
        this.socket = socket
        this.start();
    }

    start() {
        this.tiktok = setTimeout( () => {
            this.socket.emit( 'heart-beat', "ping" );
            // set disconnect timeout
            this.dead = setTimeout( () => {
                this.socket.disconnect( true );
            }, this.timeout + 60 * 1000 );
        }, this.timeout );
    }

    reset() {
        clearTimeout( this.tiktok );
        clearTimeout( this.dead );
        this.start();
    }
}

module.exports = HeartBeat;