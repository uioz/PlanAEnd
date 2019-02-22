import { Db, Collection, } from "mongodb";
import { Logger } from "log4js";
import { StreamReadAsync } from "planaend-source";

function autoLog<T extends Error>(error:T,logger:Logger) {
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
export const collectionReadAll = (collection: Collection):Promise<Array<any>>=>new Promise((resolve,reject)=>{
    const
        cursor = collection.find(),
        buffers = [];

    cursor.on('data', (chunk) => buffers.push(chunk));
    cursor.on('end', () => {

        cursor.close().catch((error)=>{
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
export async function collectionReadAllIfHave(collection:Collection){

    if (await collection.find().limit(1).hasNext()){
        return await collectionReadAll(collection);
    }

    return false;

}

/**
 * TODO 基准测试
 * 读取数据库中一部分内容
 * 该函数结合了多种查询策略.
 * 1. 提供sortkey则默认使用最优策略
 * 2. 不提供sortKey则使用skip+limit(不适合数据量大的情况)
 * 3. 不提供start或者end则查询给定数据库的所有内容
 * **注意**:只适合查询返回内容小于16Mib下的使用
 * **注意**:建议给提供的sortKey添加索引
 * **注意**:当start<end的时候报错
 * 
 * @param collection 集合对象
 * @param start 开始的起点
 * @param end 结束的起点
 * @param sortKey 排序需要使用的键
 */
export async function readOfRange(collection:Collection,start:number = 0,end:number = 0,sortKey?:string,) {

    if(start > end){

        if(start === 0 && end === 0){
            return await collection.find().toArray();
        }

        if(sortKey){
            return await collection.find({
                [sortKey]:{
                    $lt:start
                }
            }).sort({
                [sortKey]: 1
            }).limit(end).toArray();
        }

        return await collection.find().skip(start).limit(end).toArray();

    }else {
        throw new Error("Start number must be greater end number!")
    }
    
}
