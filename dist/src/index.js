"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const log4js = require("log4js");
const globalData_1 = require("./globalData");
const mongodb_1 = require("mongodb");
const app_1 = require("./app");
const collectionRead_1 = require("./model/collectionRead");
const initDatabase_1 = require("./init/initDatabase");
/**
 * 项目运行入口
 * @param Cwd 启动项目路径
 */
async function default_1(Cwd) {
    console.log('System starting,Please wait for moment!');
    console.log(`The Directory of Root is ${Cwd}`);
    const ConfigDir = path_1.resolve(Cwd, './config'), LogConfig = require(path_1.resolve(ConfigDir, './logconfig.json')), SystemConfig = require(path_1.resolve(ConfigDir, './systemConfig.json')), MongoURl = SystemConfig.system.mongodbUrl, DatabaseName = SystemConfig.system.mongodbDataBase;
    globalData_1.globalDataInstance.setConfig('logType', LogConfig);
    globalData_1.globalDataInstance.setConfig('systemConfig', SystemConfig);
    globalData_1.globalDataInstance.setLog4js(log4js.configure(LogConfig));
    // TODO 默认开发时候使用该log策略
    const defaultLoggerName = 'developmentOnlySystem', logger = globalData_1.globalDataInstance.getLogger(defaultLoggerName);
    globalData_1.globalDataInstance.setGlobalLoggerName(defaultLoggerName);
    logger.info('switch logger to log4js.');
    let MongoClient, Database;
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
    await initDatabase_1.fillDatabase(initDatabase_1.verifyDatabase(databaseList), Database, ConfigDir, logger);
    // 读取数据库中的配置文件然后覆写全局配置中的systemConfig
    try {
        const systemConfig = await collectionRead_1.collectionReadAll(Database.collection(initDatabase_1.ConfigNameMap['systemConfig']));
        globalData_1.globalDataInstance.setConfig('systemConfig', systemConfig[0]);
    }
    catch (error) {
        logger.error(error);
    }
    // 将超级管理员账户读取到全局变量中保存,为后面鉴权使用
    try {
        const SuperAccountData = await collectionRead_1.getSuperUserAccount(Database.collection(initDatabase_1.ConfigNameMap['userConfig']));
        globalData_1.globalDataInstance.setSuperUserAccount(SuperAccountData.account);
    }
    catch (error) {
        logger.error(error);
    }
    // 启动服务器
    app_1.default(Cwd, globalData_1.globalDataInstance);
}
exports.default = default_1;
