const mongoose = require( "mongoose" );
const Platform = mongoose.Schema;

module.exports = new Platform( {
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        default: "",
    },
    api_key: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        default: 1
    },
}, { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } });