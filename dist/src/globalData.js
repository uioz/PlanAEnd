"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GlobalData {
    constructor() {
        this.globalLoggers = {};
        this.configs = {};
    }
    setLog4js(obj) {
        this.log4js = obj;
        return this;
    }
    /**
     * 设置全局默认的logger名字
     */
    setGlobalLoggerName(name) {
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
    getLogger(name) {
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
    getLoggerPro(name) {
        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                if (!name) {
                    name = this.globalLoggerName;
                }
                const logger = this.globalLoggers[name];
                if (logger) {
                    resolve(logger);
                }
                resolve(this.globalLoggers[name] = this.log4js.getLogger(name));
            });
        });
    }
    setConfig(name, config) {
        this.configs[name] = config;
        return this;
    }
    getConfig(name) {
        return this.configs[name];
    }
    setMongoClient(client) {
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
    setMongoDatabase(database) {
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
    databaseClose(force = false) {
        this.getLogger().warn('The MongoClient is gonna close!');
        this.mongoClient.close(false);
    }
    /**
     * 设置超级管理员的账户名称
     * @param account 账户名称
     */
    setSuperUserAccount(account) {
        this.superAccount = account;
        return this;
    }
    /**
     * 获取超级管理员的账户名称
     */
    getSuperUserAccount() {
        return this.superAccount;
    }
}
exports.GlobalData = GlobalData;
const instance = new GlobalData();
/**
 * 该变量是GlobalData类的全局单例
 */
exports.globalDataInstance = instance;
