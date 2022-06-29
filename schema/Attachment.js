const mongoose = require( "mongoose" );
const Attachment = mongoose.Schema;

module.exports = new Attachment( {
    type: {
        type: String,
        required: true,
    },
    data: {
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