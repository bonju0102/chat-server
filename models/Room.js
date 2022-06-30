const db = require( "../public/database" );
const seq = db.Sequelize;

module.exports = seq.defineModel( 'Room', {
    platform_id: {
        type: seq.STRING,
        comment: "平台ID",
        allowNull: false
    },
    room_id: {
        type: seq.STRING,
        comment: "房間ID",
        allowNull: false
    },
    name: {
        type: seq.STRING,
        comment: "房間名稱",
        defaultValue: "未命名房間",
        allowNull: true
    },
    history_limit: {
        type: seq.TINYINT,
        comment: "歷史訊息顯示數量",
        defaultValue: 20,
        allowNull: false
    }
});
