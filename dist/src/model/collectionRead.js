"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function autoLog(error, logger) {
    if (logger) {
        return logger.error(error);
    }
    else {
        return console.error(error);
    }
}
/**
 * 从指定的集合中读取所有的内容以Buffer的形式返回
 * @param collection 集合对象
 */
exports.collectionReadAll = (collection) => new Promise((resolve, reject) => {
    const cursor = collection.find(), buffers = [];
    cursor.on('data', (chunk) => buffers.push(chunk));
    cursor.on('end', () => {
        cursor.close().catch((error) => {
            throw error;
        });
        // 震惊,MongoDB流返回的居然不是Buffer而是已经格式化好的数据
        return resolve(buffers);
        // resolve(Buffer.concat(buffers));
    });
    cursor.on('error', (error) => reject(error));
});
/**
 * 读取集合中的所有内容如果集合中存在内容
 *
 * **注意**:内部以buffer的形式返回
 * @param collection 集合对象
 * @param logger 日志对象
 */
async function collectionReadAllIfHave(collection) {
    if (await collection.find().limit(1).hasNext()) {
        return await exports.collectionReadAll(collection);
    }
    return false;
}
exports.collectionReadAllIfHave = collectionReadAllIfHave;
