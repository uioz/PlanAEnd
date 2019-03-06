import { Log4js, Logger } from "log4js";
import { MongoClient, Db, Collection } from "mongodb";

/**
 * log4js可选的categories类型,对应config/logconfig.json中的配置
 */
type loggerType = 'default' | 'production' | 'developmentAll' | 'developmentOnlySystem';

/**
 * 默认的配置文件,包括系统配置等
 */
type configType = 'systemConfig' | 'logType' | 'userConfig';

/**
 * 默认的数据的垫片文件,数据库初始化时候需要使用到
 */
type databaseInitData = '';

export class GlobalData {

    private globalLoggerName: loggerType;

    private log4js: Log4js;

    private globalLoggers: {
        [keyName: string]: Logger
    } = {};

    private configs: {
        [key in configType]: any
    } = {} as any;

    private mongoClient: MongoClient;

    private mongoDatabase: Db;

    setLog4js(obj: Log4js) {
        this.log4js = obj;
        return this;
    }

    getLog4js() {
        return this.log4js;
    }

    /**
     * 设置全局默认的logger名字
     */
    setGlobalLoggerName(name: loggerType) {
        if (!this.globalLoggerName) {
            this.globalLoggerName = name;
        }
        return this;
    }

    /**
     * 获取对应配置的Logger并且在内部进行缓存
     * 
     * 如果不指定logger的名字则使用全局初始化时候指定的logger
     * @param name looger
     */
    getLogger(name?: loggerType) {

        if (!name) {
            name = this.globalLoggerName;
        }

        const logger = this.globalLoggers[name];

        if (logger) {
            return logger;
        }

        return this.globalLoggers[name] = this.log4js.getLogger(name);

    }

    /**
     * getLogger的异步版本,为了解决Node同步解析require导致的
     * 内部获取数据的错误
     *
     * 如果不指定logger的名字则使用全局初始化时候指定的logger
     * @param name looger
     */
    getLoggerPro(name?:loggerType){
        return new Promise<Logger>((resolve,reject)=>{
            process.nextTick(()=>{
                if (!name) {
                    name = this.globalLoggerName;
                }

                const logger = this.globalLoggers[name];

                if (logger) {
                    resolve(logger);
                }

                resolve(this.globalLoggers[name] = this.log4js.getLogger(name));
            })
        });
    }

    setConfig(name: configType, config: object) {
        this.configs[name] = config;
        return this;
    }

    getConfig(name: configType) {
        return this.configs[name];
    }

    setMongoClient(client: MongoClient) {
        this.mongoClient = client;
        return this;
    }

    getMongoClient() {
        return this.mongoClient;
    }

    /**
     * 设置全局的数据库对象
     * @param database 数据库对象
     */
    setMongoDatabase(database: Db) {
        this.mongoDatabase = database;
    }

    /**
     * 获取全局的数据库对象
     */
    getMongoDatabase() {
        return this.mongoDatabase;
    }

    /**
     * 读取mongo中的服务器配置,并且到对象的内部
     * @param collection mongo集合对象
     * @param configType 读取的类型
     */
    async readConfigFromMongo(collection: Collection, configType: configType) {
        return this.configs[configType] = await collection.findOne({});
    }

    /**
     * 重写
     */
    async writeConfigToMongo() {

    }

    /**
     * 关闭全局的MongoClient客户端
     * @param force 是否强制关闭
     */
    databaseClose(force: boolean = false) {
        this.getLogger().warn('The MongoClient is gonna close!');
        this.mongoClient.close(false);
    }

}

const instance = new GlobalData();

/**
 * 该变量是GlobalData类的全局单例
 */
export const globalDataInstance = instance;