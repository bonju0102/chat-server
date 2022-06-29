const utils = require( "../utils/utils" );

const apiService = {}

// apiService.getPlatform = async ( callback ) => {
//     try {
//         await platformMgr.get( async ( result ) => {
//             let platforms = []
//             for await ( let p of result ) {
//                 platforms.push({
//                     "id": p._id.toString(),
//                     "name": p.name,
//                     "url": p.url,
//                     "api_key": p.api_key,
//                     "status": p.status,
//                     "create_time": p.create_time,
//                     "update_time": p.update_time,
//                 });
//             }
//             callback( platforms )
//         })
//     } catch ( e ) {
//         console.error( e );
//     }
// }

module.exports = apiService