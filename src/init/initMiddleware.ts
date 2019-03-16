import * as ConnectMongo from "connect-mongo";
import * as ExpressSession from "express-session";
import { SessionOptions } from "express-session";
import {
    MongoUrlOptions,
    MogooseConnectionOptions,
    NativeMongoOptions,
    NativeMongoPromiseOptions
} from "connect-mongo";
import { Db } from "mongodb";

const MongoStoreFactory = ConnectMongo(ExpressSession);

/**
 * ExpressSession的默认配置
 */
const ExpressSessionConfig = {
    secret: 'hello world',// cookie签名 这个属性是必须的 具体配置和`cookie-parser`一样
    saveUninitialized: false, // 是否自动初始化 默认为true
    resave: false,// 当用户session无变化的时候依然自动保存
    cookie: { // cookie的信息具体操作和`cookie-parser`一样
        maxAge: 1800000// 30分钟后过期
    },
    rolling: true// 每次请求的时候覆写cookie
}

/**
 * 获取express-session中间件,有默认配置请查看该文件
 * @param app Express实例
 * @param options 连接选项
 */
export const GetExpressSession = (options?: SessionOptions) => {
    return ExpressSession(Object.assign(ExpressSessionConfig, options))
}

/**
 * 该类型描述了MongoStore的选项
 */
type MongoStoreOptions = MongoUrlOptions | MogooseConnectionOptions | NativeMongoOptions | NativeMongoPromiseOptions;

const MongoStoreConfig = {
    ttl: 14 * 24 * 60 * 60,// 14天后删除
    touchAfter: 24 * 3600, // 24小时内刷新一次 前提是express-session配置了resave:false才可以
}

/**
 * 获取MongoStore实例,有默认配置请查看该文件
 * @param db 数据库对象
 * @param options 选项
 */
export const GetMongoStore = (db: Db, options?: MongoStoreOptions) => {
    return new MongoStoreFactory({
        db: (db as any),
        ...MongoStoreConfig,
        ...options
    });
}

/**
 * 获取session中间件
 * @param db mongodb Database对象
 * @param secret 用于签名cookie的字符串
 * @param options 创建mongoStore时候的选项
 */
export const GetSessionMiddleware = (db: Db, secret: string, options?: MongoStoreOptions) =>{
    return GetExpressSession({
        store:GetMongoStore(db,options),
        secret
    });
}
