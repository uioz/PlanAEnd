import { Collection, Db,CollectionInsertManyOptions } from "mongodb";

/**
 * 例举所有数据库中的集合名称
 * @param database 数据库对象
 */
export async function listCollectionsNameOfDatabase(database: Db) {

    const result: Array<string> = [];
    for (const item of (await database.listCollections({}, { nameOnly: true }).toArray())) {
        result.push(item.name);
    }

    return result;
}

/**
 * 判断给定的集合是否存在于数据中
 * @param database 数据库对象
 * @param collectionName 集合名称
 */
export async function hasCollectionInDatabase(database:Db,...collectionName:Array<string>) {
    const names = await listCollectionsNameOfDatabase(database);
    for (const collectionNameOfDatabase of names) {
        let hasName = false;
        for (const expectCollectionName of collectionName) {
            if(collectionNameOfDatabase === expectCollectionName){
                hasName = true;
                break;
            }
        }
        if(!hasName){
            return false;
        }
    }
    return true;
}

/**
 * 分段插入,将数据分段插入以提高插入内容的性能
 * @param collection 数据库对象
 * @param data 对象数组
 * @param limite 每次插入的上限
 * @param options insertMany的插入选项
 */
export async function limitWrite(collection: Collection, data: Array<any>, limite: number, options: CollectionInsertManyOptions = {}){
    
    let
        len = data.length,
        baseNumber = limite || 500,
        num = 0,
        pros = [];

    while (num * baseNumber < len && num + 1 * baseNumber < len) {
        pros.push(collection.insertMany(data.slice(num * baseNumber, ++num * baseNumber),options));
    }

    if (len > num * baseNumber) {
        pros.push(collection.insertMany(data.slice(num * baseNumber, ++num * baseNumber), options));
    }

    return Promise.all(pros);
}

/**
 * 获取过滤器,用于过滤结果中的_id
 */
export const getRemoveIdProjection = ()=>{
    return {
        _id: false
    }
}
