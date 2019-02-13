import { Db } from "mongodb";

export const DatabasePrefixName = 'source_';

/**
 * TODO 等待编写等待测试
 * @param database 要操作的数据库
 * @param data 要写入的数据
 * @param year 年份
 */
export const writeForSource = (database: Db, data: Array<any>, year: string)=>new Promise((resolve,reject)=>{

    const collection = database.collection(DatabasePrefixName + year);

    process.nextTick(() => collection.insertMany(data).then(resolve).catch(reject));

});