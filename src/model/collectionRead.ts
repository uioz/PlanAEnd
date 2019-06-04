import { Db, Collection, FilterQuery, } from "mongodb";
import { Logger } from "log4js";
import { hidden_id } from "./utils";

function autoLog<T extends Error>(error: T, logger: Logger) {
    if (logger) {
        return logger.error(error);
    } else {
        return console.error(error);
    }
}



/**
 * 从指定的集合中读取所有的内容以Buffer的形式返回
 * @param collection 集合对象
 */
export const collectionReadAll = (collection: Collection): Promise<Array<any>> => new Promise((resolve, reject) => {
    const
        cursor = collection.find({}, hidden_id),
        buffers = [];

    cursor.on('data', (chunk) => buffers.push(chunk));
    cursor.on('end', () => {

        cursor.close().catch((error) => {
            throw error;
        });
        // 震惊,MongoDB流返回的居然不是Buffer而是已经格式化好的数据
        return resolve(buffers);
        // resolve(Buffer.concat(buffers));

    });
    cursor.on('error', (error) => reject(error));

});

/**
 * 读取集合中的所有内容如果集合中存在内容
 * 
 * **注意**:以格式化的JavaScript数据结构形式返回
 * @param collection 集合对象
 * @param logger 日志对象
 */
export async function collectionReadAllIfHave(collection: Collection) {

    if (await collection.find().limit(1).hasNext()) {
        return await collectionReadAll(collection);
    }

    return false;

}

/**
 * **注意**:该函数已经废弃,原因分页排序需要根据不同集合进行针对优化.
 * 指定范围读取数据库中的内容
 * 该函数结合了多种查询策略.
 * 1. 提供sortkey则默认使用最优策略
 * 2. 不提供sortKey则使用skip+limit(不适合数据量大的情况)
 * 3. 不提供start或者end则查询给定数据库的所有内容
 * **注意**:当sorkKey作为排序键的时候才会获取高性能
 * **注意**:建议给提供的sortKey添加索引
 * **注意**:当start<end的时候报错
 * 
 * @param collection 集合对象
 * @param start 开始的起点
 * @param end 结束的起点
 * @param sortKey 排序需要使用的键
 * @param gteNumber 要进行大小比较的键
 */
export async function readOfRange(collection: Collection, start: number = 0, end: number = 0, gteNumber?: any, sortKey?: string, ): Promise<Array<any>> {

    if (start === 0 && end === 0) {
        return await collection.find({}, hidden_id).toArray();
    }

    if (end > start) {

        if (sortKey) {
            return await collection.find({
                [sortKey]: {
                    $gte: gteNumber
                }
            }, hidden_id).sort({
                [sortKey]: 1
            }).limit(start - end).toArray();
        }

        return await collection.find({}, hidden_id).skip(start).limit(start - end).toArray();

    } else {
        throw new Error("End number must be greater start number!")
    }

}

/**
 * 范围读取内容的简单版本,适合用于文档数量较少的集合.
 * **注意**:文档的start指的是跳过的内容,例如我们想从第20条记录开始,start需要指定为19
 * **注意**:当start<end的时候报错
 * @param collection 集合对象
 * @param start 范围开始的起点
 * @param end 范围结束
 * @param sortObj 排序对象
 */
export async function readOfRangeEasy(collection: Collection, start: number, end: number, sortObj: object = {}): Promise<Array<any>> {
    if (end > start) {
        return await collection.find({}, { projection: { _id: false } }).sort(sortObj).skip(start).limit(end - start).toArray();
    } else {
        throw new Error("End number must be greater start number!");
    }
}

/**
 * 从指定集合中读取用户列表(不包含超级管理员)
 * @param collection 集合对象
 */
export async function readUserList(collection: Collection) {
    return await collection.find({
        level: {
            $ne: 0
        }
    }, hidden_id).toArray();
}

/**
 * collection.findOne的过滤id版本
 * @param collection 集合对象
 */
export async function readOne(collection: Collection, filter: FilterQuery<never> = {}) {
    return await collection.findOne(filter, hidden_id);
}


interface ApiStateShape {
    /**
     * 管理员昵称
     */
    nickname: string;
    /**
     * 上次登录时间
     */
    lastLoginTime: string;
    /**
     * 客户端开放时间
     */
    startTime: string;
    /**
     * 客户端结束时间
     */
    endTime: string;
    /**
     * 服务器已经运行毫秒数
     */
    runingTime: number;
}

/**
 * 用于api/state路由的数据获取
 * @param collectionOfConfig 保存静态配置的集合对象
 * @param CollectionOfUsers 保存用户的集合对象
 * @param account 用户账户
 */
export async function readOfApiState(collectionOfConfig: Collection, CollectionOfUsers: Collection, account: string): Promise<ApiStateShape> {

    const config = await readOne(collectionOfConfig);
    const user = await CollectionOfUsers.findOne({ account }, hidden_id);

    return {
        nickname:user['nickname'],
        lastLoginTime:user['lastlogintime'],
        startTime:config['client']['openTimeRange']['startTime'],
        endTime:config['client']['openTimeRange']['endTime'],
        runingTime:Date.now() - config['server']['lastTime'],
    }

}


interface ApiServerBaseShape {
    /**
     * 全局通知
     */
    notice:string;
    /**
     * 服务器静态文件地址
     */
    public:string;
    /**
     * 应用程序名称
     */
    appname:string;
    /**
     * 名牌标志
     */
    brand:string;
    /**
     * logo
     */
    logo:string;
    /**
     * 背景图片
     */
    bg:string;
}

/**
 * 用于api/server/base的数据获取
 * @param collection 集合对象
 */
export async function readOfApiServerBase(collection:Collection):Promise<ApiServerBaseShape> {
    const assets = await readOne(collection);
    return {
        appname: assets['appname']['server'],
        notice: assets['globalnotcie']['server'],
        brand:assets['image']['brand'],
        logo:assets['image']['logo'],
        bg: assets['image']['clientbackground'],
        public:assets['publicpath']
    }
}

/**
 * 用于api/client/base的数据获取
 * @param collection 集合对象
 */
export async function readOfApiClientBase(collection: Collection): Promise<ApiServerBaseShape> {
    const assets = await readOne(collection);
    return {
        appname: assets['appname']['client'],
        notice: assets['globalnotcie']['client'],
        brand: assets['image']['brand'],
        logo: assets['image']['logo'],
        bg: assets['image']['clientbackground'],
        public:assets['publicpath']
    }
}