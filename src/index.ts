import { resolve } from "path";
import * as log4js from "log4js";
import { globalDataInstance, GlobalData } from "./globalData";
import { connect, MongoClient, Collection, Db } from "mongodb";
import { createCollection } from "./model/collectionCreate";
import { NODE_ENV } from "./types";
import App from "./app";
import { collectionReadAll } from "./model/collectionRead";

/**
 * 配置对象名称以及数据库对应的集合的名称映射
 */
enum ConfigNameMap {
    'systemConfig' = 'configuration_static',
    'configuration_static' = 'systemConfig',
    'userConfig' = 'model_users',
    'model_users' = 'userConfig'
}


/**
 * 检测数据库中是否包含了给定名称的集合名称
 * @param databaseList 数据库列表
 * @returns 没有包含的数据库名称
 */
function verifyDatabase(databaseList: Array<any>): Array<string> {

    const
        CollectionNames = [
            'configuration_static',
            'model_users'
        ],
        haveLossName = [];

    // 开发模式直接返回内容
    if (process.env.NODE_ENV === NODE_ENV.dev) {
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
            haveLossName.push(CollectionNames[collectionNamesLen])
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
async function fillDatabase(collectionNames: Array<string>, globalData: GlobalData) {

    const pros = [];

    for (const name of collectionNames) {
        pros.push(createCollection(name, globalData.getMongoDatabase(), {
            insertData: globalData.getConfig(ConfigNameMap[name]),
            force: true
        }));
        globalData.getLogger().info(`${name} started rebuild!`);
    }

    try {
        for (const item of pros) {
            const result = await item;
        }
    } catch (error) {
        globalData.getLogger().error(`initialization Database failed, reason: ${error}`);
    }


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
        userConfig = require(resolve(ConfigDir, './userConfig.json')),
        MongoURl = SystemConfig.system.mongodbUrl,
        DatabaseName = SystemConfig.system.mongodbDataBase;

    globalDataInstance.setConfig('logType', LogConfig);
    globalDataInstance.setConfig('systemConfig', SystemConfig);
    globalDataInstance.setConfig('userConfig', userConfig);
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

    /**
     * - DEV模式
     *  - 每次运行都根据给定的JSON配置初始化对应的集合
     * - PRON模式
     *  - 检测是否有未初始化的集合,如果有则根据JSON配置文件初始化它
     */
    await fillDatabase(verifyDatabase(databaseList),globalDataInstance);

    // 读取数据库中的配置文件然后覆写systemConfig
    try {
        const systemConfig = await collectionReadAll(globalDataInstance.getMongoDatabase().collection('systemConfig'));
        globalDataInstance.setConfig('systemConfig',systemConfig);
    } catch (error) {
        globalDataInstance.getLogger().error(error)
    }


    // 启动服务器
    App(Cwd, globalDataInstance);

}
