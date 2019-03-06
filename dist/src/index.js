"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const log4js = require("log4js");
const globalData_1 = require("./globalData");
const mongodb_1 = require("mongodb");
const collectionCreate_1 = require("./model/collectionCreate");
const types_1 = require("./types");
const app_1 = require("./app");
const collectionRead_1 = require("./model/collectionRead");
/**
 * 配置对象名称以及数据库对应的集合的名称映射
 */
var ConfigNameMap;
(function (ConfigNameMap) {
    ConfigNameMap["systemConfig"] = "configuration_static";
    ConfigNameMap["configuration_static"] = "systemConfig";
    ConfigNameMap["userConfig"] = "model_users";
    ConfigNameMap["model_users"] = "userConfig";
})(ConfigNameMap || (ConfigNameMap = {}));
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
/**
 * 根据给定的集合名称
 * 利用全局单例中的数据库和单例中的配置
 * 创建对应的集合,并且插入来自单例中的位置到创建的集合中
 * @param collectionNames 由集合名组成的数组
 * @param globalData 全局单例
 */
async function fillDatabase(collectionNames, globalData) {
    const pros = [];
    for (const name of collectionNames) {
        pros.push(collectionCreate_1.createCollection(name, globalData.getMongoDatabase(), {
            insertData: globalData.getConfig(ConfigNameMap[name]),
            force: true
        }));
        globalData.getLogger().info(`${name} started rebuild!`);
    }
    try {
        for (const item of pros) {
            const result = await item;
        }
    }
    catch (error) {
        globalData.getLogger().error(`initialization Database failed, reason: ${error}`);
    }
}
/**
 * 项目运行入口
 * @param Cwd 启动项目路径
 */
async function default_1(Cwd) {
    console.log('System is Runing,Please wait for moment!');
    console.log(`The Directory of Root is ${Cwd}`);
    const ConfigDir = path_1.resolve(Cwd, './config'), LogConfig = require(path_1.resolve(ConfigDir, './logconfig.json')), SystemConfig = require(path_1.resolve(ConfigDir, './systemConfig.json')), userConfig = require(path_1.resolve(ConfigDir, './userConfig.json')), MongoURl = SystemConfig.system.mongodbUrl, DatabaseName = SystemConfig.system.mongodbDataBase;
    globalData_1.globalDataInstance.setConfig('logType', LogConfig);
    globalData_1.globalDataInstance.setConfig('systemConfig', SystemConfig);
    globalData_1.globalDataInstance.setConfig('userConfig', userConfig);
    globalData_1.globalDataInstance.setLog4js(log4js.configure(LogConfig));
    // TODO 默认开发时候使用该log策略
    const defaultLoggerName = 'developmentOnlySystem', logger = globalData_1.globalDataInstance.getLogger(defaultLoggerName);
    globalData_1.globalDataInstance.setGlobalLoggerName(defaultLoggerName);
    logger.info('switch logger to log4js.');
    let MongoClient, Database, Collection;
    try {
        logger.info('Connect to MongoDB!');
        // 注意连接的数据库已经在配置文件中指定了
        MongoClient = await mongodb_1.connect(MongoURl, {
            useNewUrlParser: true
        });
        globalData_1.globalDataInstance.setMongoClient(MongoClient);
    }
    catch (error) {
        logger.error(error);
        return globalData_1.globalDataInstance.databaseClose();
    }
    Database = MongoClient.db(DatabaseName, {
        returnNonCachedInstance: true
    });
    globalData_1.globalDataInstance.setMongoDatabase(Database);
    const databaseList = await Database.listCollections().toArray();
    logger.info(`The following table to show structure of database of ${DatabaseName}.`);
    console.table(databaseList);
    /**
     * - DEV模式
     *  - 每次运行都根据给定的JSON配置初始化对应的集合
     * - PRON模式
     *  - 检测是否有未初始化的集合,如果有则根据JSON配置文件初始化它
     */
    await fillDatabase(verifyDatabase(databaseList), globalData_1.globalDataInstance);
    // 读取数据库中的配置文件然后覆写systemConfig
    try {
        const systemConfig = await collectionRead_1.collectionReadAll(globalData_1.globalDataInstance.getMongoDatabase().collection('systemConfig'));
        globalData_1.globalDataInstance.setConfig('systemConfig', systemConfig);
    }
    catch (error) {
        globalData_1.globalDataInstance.getLogger().error(error);
    }
    // 启动服务器
    app_1.default(Cwd, globalData_1.globalDataInstance);
}
exports.default = default_1;
