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
     * 获取Logger并且在内部进行缓存
     * @param name looger
     */
    getLogger(name) {
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
