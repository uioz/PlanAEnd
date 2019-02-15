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

