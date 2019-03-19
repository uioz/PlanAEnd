"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 从指定的用户集合删除指定的用户
 * @param collection 集合对象
 * @param account 账户名称
 */
async function deleteOfUser(collection, account) {
    return await collection.deleteMany({
        account
    });
}
exports.deleteOfUser = deleteOfUser;