import { Log4js,Logger } from "log4js";
import { MongoClient, Db } from "mongodb";

/**
 * log4js可选的categories类型,对应config/logconfig.json中的配置
 */
type loggerType = 'default' | 'production' | 'developmentAll' | 'developmentOnlySystem';

/**
 * 默认的配置文件,包括系统配置等
 */
type configType = 'systemConfig' | 'logType';

/**
 * 默认的数据的垫片文件,数据库初始化时候需要使用到
 */
type databaseInitData = '';

const globalData = new class GlobalData {

    private globalLoggerName:loggerType;

    private log4js: Log4js;

    private globalLoggers: {
        [keyName: string]: Logger
    } = {};

    private configs: {
        [key in configType]: any
    } = {} as any;

    private mongoClient: MongoClient;

    private mongoDatabase:Db;

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
    setGlobalLoggerName(name:loggerType){
        if(!this.globalLoggerName){
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

        if(!name){
            name = this.globalLoggerName;
        }

        const logger = this.globalLoggers[name];

        if (logger) {
            return logger;
        }

        return this.globalLoggers[name] = this.log4js.getLogger(name);

    }

    setConfig(name:configType,config:object){
        this.configs[name] = config;
        return this;
    }

    getConfig(name:configType){
        return this.configs[name];
    }

    setMongoClient(client:MongoClient){
        this.mongoClient = client;
        return this;
    }

    getMongoClient(){
        return this.mongoClient;
    }

    /**
     * 设置全局的数据库对象
     * @param database 数据库对象
     */
    setMongoDatabase(database:Db){
        this.mongoDatabase = database;
    }

    /**
     * 获取全局的数据库对象
     */
    getMongoDatabase(){
        return this.mongoDatabase;
    }

}

export default globalData;