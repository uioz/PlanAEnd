import { resolve } from "path";
import { globalDataInstance } from "./globalData";
import { connect, MongoClient} from "mongodb";
import App from "./app";
import { getAllConfig,initLog4js,toRebuildCollectionUseConfigs,toSetSuperUserAccountOfGlobalData } from "./init/init"
import { timeRecord } from "./utils/timeRecord";


/**
 * 项目运行入口
 * @param Cwd 启动项目路径
 */
export default async function (Cwd: string) {

    console.log('System starting,Please wait for moment!');
    console.log(`The root of directory is ${Cwd}`);

    globalDataInstance.setCwd(Cwd);
    
    const 
        CONFIGS_DIRECTORY = resolve(Cwd,'./config');

    const configs = await getAllConfig(CONFIGS_DIRECTORY);

    // 挂载所有的静态配置文件到全局共用对象上.
    globalDataInstance.setConfigs(configs);

    
    const logger = initLog4js(globalDataInstance);
    
    // 挂载 logger 到 globalData 上.
    globalDataInstance.setLogger(logger);

    const 
        MONGO_URL = configs.configuration_static.system.mongodbUrl,
        DATABASE_NAME = configs.configuration_static.system.mongodbDataBase;

    logger.info('connecting to MongoDB!');

    let MongoClient:MongoClient;

    try {

        MongoClient = await connect(MONGO_URL,{
            useNewUrlParser:true
        });

        globalDataInstance.setMongoClient(MongoClient);
        
    } catch (error) {
        logger.error(error);
        return ;
    }

    const Database = MongoClient.db(DATABASE_NAME, {
        noListener: true,
        returnNonCachedInstance: false
    });

    globalDataInstance.setMongoDatabase(Database);

    const databaseList = await Database.listCollections().toArray();
    logger.info(`The following table to show structure of database of ${DATABASE_NAME}.`);
    console.table(databaseList);

    await toRebuildCollectionUseConfigs(globalDataInstance,configs);

    await toSetSuperUserAccountOfGlobalData(globalDataInstance);

    // 启动服务器
    App(Cwd, globalDataInstance);

    // 每分钟记录一次已经运行的时间
    timeRecord((hadRuningDate)=>{

        Database.collection('configuration_static').updateOne({},{
            $set:{
                'system.runningTime':hadRuningDate
            }
        });

    });

}
