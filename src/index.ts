import { resolve } from "path";
import * as log4js from "log4js";
import {globalDataInstance} from "./globalData";
import { connect, MongoClient, Collection, Db } from "mongodb";
import { createCollection } from "./DAO/collectionCreate";
import { NODE_ENV } from "./types";
import App from "./app";

/**
 * 检测是否需要数据库初始化
 * @param key 数据库名称
 * @param databaseList 数据库列表
 */
function needInit(key: string, databaseList: Array<any>): boolean {

    if (process.env.NODE_ENV === NODE_ENV.dev){
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
enum ConfigNameMap {
    'systemConfig' = 'configuration_static'
}

/**
 * 项目运行入口
 * @param Cwd 启动项目路径
 */
export default async function (Cwd: string) {

    console.log('System is Runing,Please wait for moment!');
    console.log(`The Directory of Root is ${Cwd}`);

    const
        ConfigDir = resolve(Cwd, './config'),
        LogConfig = require(resolve(ConfigDir, './logconfig.json')),
        SystemConfig = require(resolve(ConfigDir, './systemConfig.json')),
        MongoURl = SystemConfig.system.mongodbUrl,
        DatabaseName = SystemConfig.system.mongodbDataBase;

    globalDataInstance.setConfig('logType', LogConfig);
    globalDataInstance.setConfig('systemConfig', SystemConfig);
    globalDataInstance.setLog4js(log4js.configure(LogConfig));

    // TODO 默认开发时候使用该log策略
    const
        defaultLoggerName = 'developmentOnlySystem',
        logger = globalDataInstance.getLogger(defaultLoggerName);

    globalDataInstance.setGlobalLoggerName(defaultLoggerName);
    logger.info('switch logger to log4js.');

    let
        MongoClient: MongoClient,
        Database: Db,
        Collection: Collection;

    try {

        logger.info('Connect to MongoDB!');

        // 注意连接的数据库已经在配置文件中指定了
        MongoClient = await connect(MongoURl, {
            useNewUrlParser: true
        });

        globalDataInstance.setMongoClient(MongoClient);

    } catch (error) {
        logger.error(error);
        return globalDataInstance.databaseClose();
    }

    Database = MongoClient.db(DatabaseName, {
        returnNonCachedInstance: true
    });
    globalDataInstance.setMongoDatabase(Database);

    const databaseList = await Database.listCollections().toArray();
    logger.info(`The following table to show structure of database of ${DatabaseName}.`);
    console.table(databaseList);

    // 如果是首次启动将系统配置移动到数据库中
    // 开发模式将始终覆写数据库
    if (needInit('configuration_static', databaseList)) {
        try {
            Collection = await createCollection('configuration_static', Database, {
                force: true,
                insertData: globalDataInstance.getConfig('systemConfig')
            });
        } catch (error) {
            logger.error(`initialization Database failed, reason: ${error}`);
            return globalDataInstance.databaseClose();
        }
    } else {
        // 不是首次启动则从数据库中获取系统配置
        Collection = Database.collection(ConfigNameMap['systemConfig']);
        try {
            await globalDataInstance.readConfigFromMongo(Collection,'systemConfig');
        } catch (error) {
            logger.error(`Cannot get collection named ${ConfigNameMap['systemConfig']} From Database of ${DatabaseName}`);
            return globalDataInstance.databaseClose(); 
        }
    }

    // 启动服务器
    App(Cwd,globalDataInstance);

}
