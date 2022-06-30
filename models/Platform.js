const db = require( "../public/database" );
const seq = db.Sequelize;

module.exports = seq.defineModel( 'Platform', {
    name: {
        type: seq.STRING,
        comment: "平台名稱",
        allowNull: false
    },
    url: {
        type: seq.STRING,
        comment: "URL",
        defaultValue: ""
    },
    api_key: {
        type: seq.STRING,
        comment: "API Key",
        allowNull: false
    },
    status: {
        type: seq.TINYINT,
        comment: "0: 封停, 1: 啟用",
        defaultValue: 1,
        allowNull: false
    }
});
