const mongoose = require( "mongoose" );
const Message = mongoose.Schema;

module.exports = new Message( {
    uid: {
        type: String,
        required: true,
    },
    socket_id: {
        type: String,
        required: true,
    },
    room_id: {
        type: String,
        required: true,
    },
    msg: {
        type: String,
        required: true,
    },
}, {
    timestamps: {
        createdAt: 'create_time',
        updatedAt: 'update_time'
    },
    capped: 8192,
});