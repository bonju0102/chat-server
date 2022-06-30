const db = require( "../public/database" );
const seq = db.Sequelize;

module.exports = seq.defineModel( 'Message', {
    uid: {
        type: seq.STRING,
        comment: "用戶ID",
        allowNull: false
    },
    socket_id: {
        type: seq.STRING,
        comment: "socket ID",
        allowNull: false
    },
    room_id: {
        type: seq.STRING,
        comment: "房間ID",
        allowNull: false
    },
    msg: {
        type: seq.STRING,
        comment: "訊息內容",
        allowNull: false
    }
});
