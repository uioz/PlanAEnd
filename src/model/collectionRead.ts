import { Db, Collection } from "mongodb";
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
 * **注意**:内部以buffer的形式返回
 * @param collection 集合对象
 * @param logger 日志对象
 */
export async function collectionReadAllIfHave(collection:Collection){

    if (await collection.find().limit(1).hasNext()){
        return await collectionReadAll(collection);
    }

    return false;

}
