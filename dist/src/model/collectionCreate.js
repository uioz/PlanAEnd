"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 创建集合并且插入操作
 * **注意**:
 * **注意**:在标准规范中指定max的时候还需要指定size,
 * 使用自定义选项只指定max会将size设置为50Mib的大小
 * @param name 要被创建的名称的name
 * @param db 数据库对象
 * @param option 自定义选项
 * @param createOptinos 标准的集合选项
 * @returns 集合对象
 */
async function createCollection(name, db, option = {}, createOptinos = {}) {
    const complete = Object.assign({ capped: (option.size || option.max) ? true : false }, option, createOptinos);
    try {
        delete complete.insertData;
        delete complete.force;
    }
    catch (error) {
    }
    // 给符合条件的集合指定默认大小50Mib
    if (complete.max && !complete.size) {
        complete.size = 6553600;
    }
    if (option.force) {
        // 先删除后创建不然会创建失败
        await db.dropCollection(name).catch(() => {
            // 忽略错误处理,如果集合不存在的话会报错
        });
    }
    const collection = await db.createCollection(name, complete);
    if (option.insertData) {
        await collection.insertOne(option.insertData);
    }
    return collection;
}
exports.createCollection = createCollection;
