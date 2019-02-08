import { resolve } from "path";
import * as log4js from "log4js";
import globalData from "./globalData";
import { connect, MongoClient } from "mongodb";
import init from "./init";

/**
 * 检测是否需要数据库初始化
 * @param key 数据库名称
 * @param databaseList 数据库列表
 */
function needInit(key:string,databaseList:Array<any>):boolean {

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
export default async function (Cwd: string) {

    console.log('System is Runing,Please wait for moment!');
    console.log(`The Directory of Root is ${Cwd}`);

    const
        ConfigDir = resolve(Cwd, './config'),
        LogConfig = require(resolve(ConfigDir, './logconfig.json')),
        SysConfig = require(resolve(ConfigDir, './systemConfig.json'));

    globalData.setConfig('logType', LogConfig);
    globalData.setConfig('systemConfig', SysConfig);
    globalData.setLog4js(log4js.configure(LogConfig));

    // TODO 默认开发时候使用该策略
    const 
        defaultLoggerName = 'developmentOnlySystem',
        logger = globalData.getLogger(defaultLoggerName);
    
    globalData.setGlobalLoggerName(defaultLoggerName);
    logger.info('switch on logger to log4js.');

    let MongoClient: MongoClient;

    try {

        logger.info('Connect to MongoDB!');
        
        // 注意连接的数据库已经在配置文件中指定了
        MongoClient = await connect(SysConfig.system.mongodbUrl,{
            useNewUrlParser:true
        });

        globalData.setMongoClient(MongoClient);

    } catch (error) {
        logger.error(error);
        return;
    }

    const database = MongoClient.db(SysConfig.system.mongodbDataBase,{
        returnNonCachedInstance:true
    });

    globalData.setMongoDatabase(database);

    const databaseList = await database.listCollections().toArray();

    logger.info(`The following table to show structure of database in ${SysConfig.system.mongodbDataBase}.`);

    console.table(databaseList);

    if (needInit('configuration_static',databaseList)){
        init(databaseList,ConfigDir);
    }

}
