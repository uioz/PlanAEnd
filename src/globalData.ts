import { Log4js, Logger } from "log4js";
import { MongoClient, Db } from "mongodb";
import * as DotProp from "dot-prop";
import { mode,configTree,configTreeKeyType } from "./types";


/**
 * log4js可选的categories类型,对应config/logconfig.json中的配置
 */
type loggerType = 'default' | 'production' | 'developmentAll' | 'developmentOnlySystem';


export class GlobalData {

    public mode: mode = (process.env.NODE_ENV) as mode;

    private log4js: Log4js;

    private logger:Logger;

    private configs: configTree = {
        configuration_static:undefined,
        log_static:undefined,
        model_assets:undefined,
        model_users:undefined
    };

    private mongoClient: MongoClient;

    private mongoDatabase: Db;

    private superUserId:string;

    private CWD: string;

    setCwd(path:string){
        this.CWD = path;
    }

    getCwd(){
        return this.CWD;
    }

    setLog4js(obj: Log4js) {
        this.log4js = obj;
        return this;
    }

    setLogger(logger:Logger){
        this.logger = logger;
    }

    /**
     * 获取 logger 实例.  
     * **注意**:调用前确保 globalData 中已经设置了 logger 实例
     */
    getLogger() {
        return this.logger;
    }

    /**
     * getLogger 的异步版本,为了解决 Node 同步解析 require 导致的问题. 
     * **注意**:调用前确保 globalData 中已经设置了 logger 实例
     */
    // getLoggerPro(){
    //     return new Promise<Logger>((resolve,reject)=>{
    //         process.nextTick(()=>{
    //             resolve(this.getLogger());
    //         })
    //     });
    // }

    setConfigs(originConfigTree: configTree) {
        this.configs = originConfigTree;
        return this;
    }

    getConfig(name: configTreeKeyType) {
        return this.configs[name];
    }

    setMongoClient(client: MongoClient) {
        this.mongoClient = client;
        return this;
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
     * 关闭全局的MongoClient客户端
     * @param force 是否强制关闭
     */
    databaseClose(force: boolean = false) {
        this.getLogger().warn('The MongoClient is gonna close!');
        this.mongoClient.close(false);
    }

    /**
     * 设置超级管理员的用户id
     * @param userId 用户id
     */
    setSuperUserId(userId:string){
        this.superUserId = userId;
        return this;
    }

    /**
     * 获取超级管理员的用户id
     */
    getSuperUserId(){
        return this.superUserId;
    }

    /**
     * 将给给定的静态文件名称和内部公开的`publicPath`合并为一个可以请求的文件地址.  
     * @param staticFileName 静态文件名称
     */
    makePublicFileUrl(staticFileName:string){

        const publicUrlPrefix = DotProp.get(this.getConfig('configuration_static'),'assets.publicUrlPrefix');

        // lazy function
        this.makePublicFileUrl = (staticFileName: string) => {
            return `${publicUrlPrefix}/${staticFileName}`;
        }

        return `${publicUrlPrefix}/${staticFileName}`;

    }

}

const instance = new GlobalData();

/**
 * 该变量是GlobalData类的全局单例
 */
export const globalDataInstance = instance;