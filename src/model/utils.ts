import { Collection, Db } from "mongodb";

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
 * 
 * @param collection 
 * @param data 
 * @param limite 
 */
export async function lessWrite(collection:Collection,data:Array<any>,limite:number){
    
    let
        len = data.length,
        baseNumber = limite || 500,
        num = 0,
        pros = [];

    while (num * baseNumber > len && num + 1 * baseNumber < len) {
        pros.push(collection.insertMany(data.slice(num * baseNumber, num++ * baseNumber)));
    }

    pros.push(collection.insertMany(data.slice(num * baseNumber, num++ * baseNumber)));

    return Promise.all(pros);
}
