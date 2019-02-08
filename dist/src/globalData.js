"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    /**
     * 读取mongo中的服务器配置,并且到对象的内部
     * @param collection mongo集合对象
     * @param configType 读取的类型
     */
    readConfigFromMongo(collection, configType) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.configs[configType] = yield collection.findOne({});
        });
    }
    /**
     * 重写
     */
    writeConfigToMongo() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * 关闭全局的MongoClient客户端
     * @param force 是否强制关闭
     */
    databaseClose(force = false) {
        this.getLogger().warn('The MongoClient is gonna close!');
        this.mongoClient.close(false);
    }
}
exports.GlobalData = GlobalData;
/**
 * 该变量是GlobalData类的全局单例
 */
exports.globalData = new GlobalData;
