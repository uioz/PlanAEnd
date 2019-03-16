"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectMongo = require("connect-mongo");
const ExpressSession = require("express-session");
const MongoStoreFactory = ConnectMongo(ExpressSession);
/**
 * ExpressSession的默认配置
 */
const ExpressSessionConfig = {
    secret: 'hello world',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1800000 // 30分钟后过期
    },
    rolling: true // 每次请求的时候覆写cookie
};
/**
 * 获取express-session中间件,有默认配置请查看该文件
 * @param app Express实例
 * @param options 连接选项
 */
exports.GetExpressSession = (options) => {
    return ExpressSession(Object.assign(ExpressSessionConfig, options));
};
const MongoStoreConfig = {
    ttl: 14 * 24 * 60 * 60,
    touchAfter: 24 * 3600,
};
/**
 * 获取MongoStore实例,有默认配置请查看该文件
 * @param db 数据库对象
 * @param options 选项
 */
exports.GetMongoStore = (db, options) => {
    return new MongoStoreFactory(Object.assign({ db: db }, MongoStoreConfig, options));
};
/**
 * 获取session中间件
 * @param db mongodb Database对象
 * @param secret 用于签名cookie的字符串
 * @param options 创建mongoStore时候的选项
 */
exports.GetSessionMiddleware = (db, secret, options) => {
    return exports.GetExpressSession({
        store: exports.GetMongoStore(db, options),
        secret
    });
};
