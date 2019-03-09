"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collectionCreate_1 = require("../model/collectionCreate");
const types_1 = require("../types");
const path_1 = require("path");
/**
 * 配置对象名称以及数据库对应的集合的名称映射
 */
var ConfigNameMap;
(function (ConfigNameMap) {
    ConfigNameMap["systemConfig"] = "configuration_static";
    ConfigNameMap["configuration_static"] = "systemConfig";
    ConfigNameMap["userConfig"] = "model_users";
    ConfigNameMap["model_users"] = "userConfig";
})(ConfigNameMap = exports.ConfigNameMap || (exports.ConfigNameMap = {}));
/**
 * 检测数据库中是否包含了给定名称的集合名称
 * @param databaseList 数据库列表
 * @returns 没有包含的数据库名称
 */
function verifyDatabase(databaseList) {
    const CollectionNames = [
        'configuration_static',
        'model_users'
    ], haveLossName = [];
    // 开发模式直接返回内容
    if (process.env.NODE_ENV === types_1.NODE_ENV.dev) {
        return CollectionNames;
    }
    let collectionNamesLen = CollectionNames.length;
    while (collectionNamesLen--) {
        let databaseListLen = databaseList.length;
        while (databaseListLen--) {
            if (databaseList[databaseListLen].name === CollectionNames[collectionNamesLen]) {
                break;
            }
        }
        if (databaseListLen === -1) {
            haveLossName.push(CollectionNames[collectionNamesLen]);
        }
    }
    return haveLossName;
}
exports.verifyDatabase = verifyDatabase;
/**
 * 从指定的源路径中读取JSON数据
 * 然后存放到指定名称的数据库中的集合中
 * @param collectionNames 由集合名组成的数组
 * @param database 在该数据库中创建集合
 * @param filePath 存放源配置的路径
 */
async function fillDatabase(collectionNames, database, filePath, logger) {
    const pros = [];
    for (const name of collectionNames) {
        pros.push(collectionCreate_1.createCollection(name, database, {
            insertData: require(path_1.resolve(filePath, `${ConfigNameMap[name]}.json`)),
            force: true
        }));
        logger.info(`${name} started rebuilding!`);
    }
    try {
        for (const item of pros) {
            const collection = await item;
            if (collection.collectionName === ConfigNameMap['userConfig']) {
                await collection.createIndex('account', {
                    unique: true
                });
            }
        }
    }
    catch (error) {
        logger.error(`initialization Database failed, reason: ${error}`);
    }
}
exports.fillDatabase = fillDatabase;
