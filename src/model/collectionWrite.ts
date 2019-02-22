import { Db, InsertWriteOpResult } from "mongodb";
import {limitWrite} from "./utils";

export const DatabasePrefixName = 'source_';

/**
 * 向数据库中插入指定年份的源数据
 * @param database 数据库对象
 * @param data 要插入的数据
 * @param year 插入的年份
 */
export async function writeOfSource(database: Db, data: Array<any>, year: string) {

    const 
        collection = database.collection(DatabasePrefixName + year),
        pros = [];

    // 重复创建索引是没有问题的
    await collection.createIndex({ number: 1 }, {
        unique: true
    });

    return limitWrite(collection,data,1000,{
        ordered: false // 不排序以提高插入性能 see https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/index.html#db.collection.insertMany
    });

}