import { resolve } from "path";
import * as log4js from "log4js";
import { globalDataInstance } from "./globalData";
import { connect, MongoClient, Db } from "mongodb";
import App from "./app";
import { collectionReadAll, getSuperUserAccount } from "./model/collectionRead";
import { ConfigNameMap,fillDatabase,verifyDatabase } from "./init/initDatabase";

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
        Database: Db;
    
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

    /**
     * - DEV模式
     *  - 每次运行都根据给定的JSON配置初始化对应的集合
     * - PRON模式
     *  - 检测是否有未初始化的集合,如果有则根据JSON配置文件初始化它
     */
    await fillDatabase(verifyDatabase(databaseList),Database,ConfigDir,logger);

    // 读取数据库中的配置文件然后覆写全局配置中的systemConfig
    try {
        const systemConfig = await collectionReadAll(Database.collection(ConfigNameMap['systemConfig']));
        globalDataInstance.setConfig('systemConfig',systemConfig[0]);
    } catch (error) {
        logger.error(error)
    }

    // 将超级管理员账户读取到全局变量中保存,为后面鉴权使用
    try{
        const SuperAccountData = await getSuperUserAccount(Database.collection(ConfigNameMap['userConfig']));
        globalDataInstance.setSuperUserAccount(SuperAccountData.account);
    }catch(error){
        logger.error(error);
    }

    // 启动服务器
    App(Cwd, globalDataInstance);

}
