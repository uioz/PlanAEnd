"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 例举所有数据库中的集合名称
 * @param database 数据库对象
 */
async function listCollectionsNameOfDatabase(database) {
    const result = [];
    for (const item of (await database.listCollections({}, { nameOnly: true }).toArray())) {
        result.push(item.name);
    }
    return result;
}
exports.listCollectionsNameOfDatabase = listCollectionsNameOfDatabase;
/**
 * 判断给定的集合是否存在于数据中
 * @param database 数据库对象
 * @param collectionName 集合名称
 */
async function hasCollectionInDatabase(database, ...collectionName) {
    const names = await listCollectionsNameOfDatabase(database);
    for (const collectionNameOfDatabase of names) {
        let hasName = false;
        for (const expectCollectionName of collectionName) {
            if (collectionNameOfDatabase === expectCollectionName) {
                hasName = true;
                break;
            }
        }
        if (!hasName) {
            return false;
        }
    }
    return true;
}
exports.hasCollectionInDatabase = hasCollectionInDatabase;
/**
 * 分段插入,将数据分段插入以提高插入内容的性能
 * @param collection 数据库对象
 * @param data 对象数组
 * @param limite 每次插入的上限
 * @param options insertMany的插入选项
 */
async function limitWrite(collection, data, limite, options = {}) {
    let len = data.length, baseNumber = limite || 500, num = 0, pros = [];
    while (num * baseNumber < len && num + 1 * baseNumber < len) {
        pros.push(collection.insertMany(data.slice(num * baseNumber, ++num * baseNumber), options));
    }
    if (len > num * baseNumber) {
        pros.push(collection.insertMany(data.slice(num * baseNumber, ++num * baseNumber), options));
    }
    return Promise.all(pros);
}
exports.limitWrite = limitWrite;
