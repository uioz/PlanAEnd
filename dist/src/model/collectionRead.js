"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
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
    const cursor = collection.find({}, utils_1.hidden_id), buffers = [];
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
 * **注意**:以格式化的JavaScript数据结构形式返回
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
/**
 * **注意**:该函数已经废弃,原因分页排序需要根据不同集合进行针对优化.
 * 指定范围读取数据库中的内容
 * 该函数结合了多种查询策略.
 * 1. 提供sortkey则默认使用最优策略
 * 2. 不提供sortKey则使用skip+limit(不适合数据量大的情况)
 * 3. 不提供start或者end则查询给定数据库的所有内容
 * **注意**:当sorkKey作为排序键的时候才会获取高性能
 * **注意**:建议给提供的sortKey添加索引
 * **注意**:当start<end的时候报错
 *
 * @param collection 集合对象
 * @param start 开始的起点
 * @param end 结束的起点
 * @param sortKey 排序需要使用的键
 * @param gteNumber 要进行大小比较的键
 */
async function readOfRange(collection, start = 0, end = 0, gteNumber, sortKey) {
    if (start === 0 && end === 0) {
        return await collection.find({}, utils_1.hidden_id).toArray();
    }
    if (end > start) {
        if (sortKey) {
            return await collection.find({
                [sortKey]: {
                    $gte: gteNumber
                }
            }, utils_1.hidden_id).sort({
                [sortKey]: 1
            }).limit(start - end).toArray();
        }
        return await collection.find({}, utils_1.hidden_id).skip(start).limit(start - end).toArray();
    }
    else {
        throw new Error("End number must be greater start number!");
    }
}
exports.readOfRange = readOfRange;
/**
 * 范围读取内容的简单版本,适合用于文档数量较少的集合.
 * **注意**:文档的start指的是跳过的内容,例如我们想从第20条记录开始,start需要指定为19
 * **注意**:当start<end的时候报错
 * @param collection 集合对象
 * @param start 范围开始的起点
 * @param end 范围结束
 * @param sortObj 排序对象
 */
async function readOfRangeEasy(collection, start, end, sortObj = {}) {
    if (end > start) {
        return await collection.find({}, { projection: { _id: false } }).sort(sortObj).skip(start).limit(end - start).toArray();
    }
    else {
        throw new Error("End number must be greater start number!");
    }
}
exports.readOfRangeEasy = readOfRangeEasy;
/**
 * 从指定集合中读取用户列表(不包含超级管理员)
 * @param collection 集合对象
 */
async function readUserList(collection) {
    return await collection.find({
        level: {
            $ne: 0
        }
    }, utils_1.hidden_id).toArray();
}
exports.readUserList = readUserList;
/**
 * 获取超级用户的账户名称
 * @param collection 集合对象
 */
async function getSuperUserAccount(collection) {
    return await collection.findOne({
        level: 0
    }, utils_1.hidden_id);
}
exports.getSuperUserAccount = getSuperUserAccount;
/**
 * collection.findOne的过滤id版本
 * @param collection 集合对象
 */
async function readOne(collection, filter = {}) {
    return await collection.findOne(filter, utils_1.hidden_id);
}
exports.readOne = readOne;
async function readOfApiState(collectionOfConfig, CollectionOfUsers, account) {
    const config = await readOne(collectionOfConfig);
    const user = await CollectionOfUsers.findOne({ account }, utils_1.hidden_id);
    return {
        nickname: user['nickname'],
        lastLoginTime: user['lastlogintime'],
        startTime: config['open']['openTimeRange']['startTime'],
        endTime: config['open']['openTimeRange']['endTime'],
        runingTime: Date.now() - config['server']['runingTime'],
    };
}
exports.readOfApiState = readOfApiState;
