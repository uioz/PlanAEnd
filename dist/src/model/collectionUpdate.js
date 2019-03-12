"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 更新用户信息(不包括帐号)
 * @param collection 集合对象
 * @param data 用户数据
 */
async function updateOfUser(collection, data) {
    const account = data.account;
    return await collection.updateOne({
        account
    }, {
        $set: Object.assign({}, data)
    }, {
        upsert: true
    });
}
exports.updateOfUser = updateOfUser;
