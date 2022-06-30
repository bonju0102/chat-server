const config = require( `../config/${process.env.NODE_ENV}_config.js` );
const db = require( "../public/database" );
const seq = db.Sequelize;

module.exports = seq.defineModel( 'Attachment', {
    name: {
        type: seq.STRING,
        comment: "檔案名稱",
        allowNull: false
    },
    path: {
        type: seq.STRING,
        comment: "路徑",
        allowNull: false
    },
    type: {
        type: seq.STRING,
        comment: "檔案類型",
        allowNull: false
    },
    uploader: {
        type: seq.STRING,
        comment: "上傳人",
        allowNull: false
    },
    fileUrl: {
        type: seq.VIRTUAL,
        get() {
            return config.backendUrl + this.path;
        }
    }
});
