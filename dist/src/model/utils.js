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
 * 判断集合是否被创建
 * **原理**:利用已经创建的集合集合的stats().ok 返回0(未创建)1(创建)进行判断
 * @param collection 集合对象
 */
async function DatabaseIsFirstCreate(collection) {
    return !!(await collection.stats()).ok;
}
exports.DatabaseIsFirstCreate = DatabaseIsFirstCreate;
