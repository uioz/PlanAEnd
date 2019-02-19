import { Db, InsertWriteOpResult } from "mongodb";

export const DatabasePrefixName = 'source_';

/**
 * TODO 等待编写等待测试
 * @param database 要操作的数据库
 * @param data 要写入的数据
 * @param year 年份
 */
export const writeForSource = (database: Db, data: Array<any>, year: string): Promise<InsertWriteOpResult> => new Promise((resolve, reject) => {

    const collection = database.collection(DatabasePrefixName + year);

    process.nextTick(() => collection.insertMany(data, {
        ordered: false // 不排序提高插入性能
    }).then(resolve).catch(reject));

});

export async function writeOfSource(database: Db, data: Array<any>, year: string) {

    const 
        collection = database.collection(DatabasePrefixName + year),
        pros = [];

    await collection.createIndex({ number: 1 }, {
        unique: true
    });

    let 
        len = data.length,
        baseNumber = 500,
        num = 0;

    while(num * baseNumber > len && num+1 * baseNumber < len){
        pros.push(collection.insertMany(data.slice(num * baseNumber,num++ * baseNumber)));
    }
    // TODO 限制写转移到utils中
    // 即使剩下的内容的长度不够500我们依然可以按照500进行切割
    pros.push(collection.insertMany(data.slice(num * baseNumber, num++ * baseNumber)));

    return Promise.all(pros);

}