"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * 向数据库中插入指定年份的源数据
 * @param database 数据库对象
 * @param data 要插入的数据
 * @param year 插入的年份
 */
async function writeOfSource(collection, data) {
    // 重复创建索引是没有问题的
    await collection.createIndex({ number: 1 }, {
        unique: true
    });
    return utils_1.limitWrite(collection, data, 1000, {
        ordered: false // 不排序以提高插入性能 see https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/index.html#db.collection.insertMany
    });
}
exports.writeOfSource = writeOfSource;
/**
 * 向指定集合写入新的专业模型
 */
async function writeOfModel(collection, data) {
    return await collection.findOneAndReplace({}, data, {
        upsert: true
    });
}
exports.writeOfModel = writeOfModel;
/**
 * 向指定集合写入服务器开放时间
 */
async function writeOfOpen(collection, startTime, endTime) {
    return await collection.updateOne({}, {
        $set: {
            'client.openTimeRange.startTime': startTime,
            'client.openTimeRange.endTime': endTime
        }
    });
}
exports.writeOfOpen = writeOfOpen;
