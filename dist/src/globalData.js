"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalData = new class GlobalData {
    constructor() {
        this.globalLoggers = {};
        this.configs = {};
    }
    setLog4js(obj) {
        this.log4js = obj;
        return this;
    }
    getLog4js() {
        return this.log4js;
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
};
exports.default = globalData;
