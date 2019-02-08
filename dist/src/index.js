"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const log4js = require("log4js");
const globalData_1 = require("./globalData");
const mongodb_1 = require("mongodb");
const init_1 = require("./init");
/**
 * 检测是否需要数据库初始化
 * @param key 数据库名称
 * @param databaseList 数据库列表
 */
function needInit(key, databaseList) {
    for (const item of databaseList) {
        if (item.name === 'configuration_static') {
            return false;
        }
    }
    return true;
}
/**
 * 项目运行入口
 * @param Cwd 启动项目路径
 */
function default_1(Cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('System is Runing,Please wait for moment!');
        console.log(`The Directory of Root is ${Cwd}`);
        const ConfigDir = path_1.resolve(Cwd, './config'), LogConfig = require(path_1.resolve(ConfigDir, './logconfig.json')), SysConfig = require(path_1.resolve(ConfigDir, './systemConfig.json'));
        globalData_1.default.setConfig('logType', LogConfig);
        globalData_1.default.setConfig('systemConfig', SysConfig);
        globalData_1.default.setLog4js(log4js.configure(LogConfig));
        // TODO 默认开发时候使用该策略
        const defaultLoggerName = 'developmentOnlySystem', logger = globalData_1.default.getLogger(defaultLoggerName);
        globalData_1.default.setGlobalLoggerName(defaultLoggerName);
        logger.info('switch on logger to log4js.');
        let MongoClient;
        try {
            logger.info('Connect to MongoDB!');
            // 注意连接的数据库已经在配置文件中指定了
            MongoClient = yield mongodb_1.connect(SysConfig.system.mongodbUrl, {
                useNewUrlParser: true
            });
            globalData_1.default.setMongoClient(MongoClient);
        }
        catch (error) {
            logger.error(error);
            return;
        }
        const database = MongoClient.db(SysConfig.system.mongodbDataBase, {
            returnNonCachedInstance: true
        });
        globalData_1.default.setMongoDatabase(database);
        const databaseList = yield database.listCollections().toArray();
        logger.info(`The following table to show structure of database in ${SysConfig.system.mongodbDataBase}.`);
        console.table(databaseList);
        if (needInit('configuration_static', databaseList)) {
            init_1.default(databaseList, ConfigDir);
        }
    });
}
exports.default = default_1;
