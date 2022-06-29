const mongoose = require( "mongoose" );
const Room = mongoose.Schema;

module.exports = new Room( {
    platform_id: {
        type: String,
        required: true,
    },
    room_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        default: "未命名房間",
    },
    history_limit: {
        type: Number,
        default: 20
    },
}, { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } });