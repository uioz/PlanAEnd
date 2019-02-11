"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const log4js = require("log4js");
const globalData_1 = require("./globalData");
const mongodb_1 = require("mongodb");
const collectionCreate_1 = require("./model/collectionCreate");
const types_1 = require("./types");
const app_1 = require("./app");
/**
 * 检测是否需要数据库初始化
 * @param key 数据库名称
 * @param databaseList 数据库列表
 */
function needInit(key, databaseList) {
    if (process.env.NODE_ENV === types_1.NODE_ENV.dev) {
        return true;
    }
    for (const item of databaseList) {
        if (item.name === 'configuration_static') {
            return false;
        }
    }
    return true;
}
/**
 * 配置对象名称以及数据库对应的集合的名称映射
 */
var ConfigNameMap;
(function (ConfigNameMap) {
    ConfigNameMap["systemConfig"] = "configuration_static";
})(ConfigNameMap || (ConfigNameMap = {}));
/**
 * 项目运行入口
 * @param Cwd 启动项目路径
 */
async function default_1(Cwd) {
    console.log('System is Runing,Please wait for moment!');
    console.log(`The Directory of Root is ${Cwd}`);
    const ConfigDir = path_1.resolve(Cwd, './config'), LogConfig = require(path_1.resolve(ConfigDir, './logconfig.json')), SystemConfig = require(path_1.resolve(ConfigDir, './systemConfig.json')), MongoURl = SystemConfig.system.mongodbUrl, DatabaseName = SystemConfig.system.mongodbDataBase;
    globalData_1.globalDataInstance.setConfig('logType', LogConfig);
    globalData_1.globalDataInstance.setConfig('systemConfig', SystemConfig);
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
    // 如果是首次启动将系统配置移动到数据库中
    // 开发模式将始终覆写数据库
    if (needInit('configuration_static', databaseList)) {
        try {
            Collection = await collectionCreate_1.createCollection('configuration_static', Database, {
                force: true,
                insertData: globalData_1.globalDataInstance.getConfig('systemConfig')
            });
        }
        catch (error) {
            logger.error(`initialization Database failed, reason: ${error}`);
            return globalData_1.globalDataInstance.databaseClose();
        }
    }
    else {
        // 不是首次启动则从数据库中获取系统配置
        Collection = Database.collection(ConfigNameMap['systemConfig']);
        try {
            await globalData_1.globalDataInstance.readConfigFromMongo(Collection, 'systemConfig');
        }
        catch (error) {
            logger.error(`Cannot get collection named ${ConfigNameMap['systemConfig']} From Database of ${DatabaseName}`);
            return globalData_1.globalDataInstance.databaseClose();
        }
    }
    // 启动服务器
    app_1.default(Cwd, globalData_1.globalDataInstance);
}
exports.default = default_1;
