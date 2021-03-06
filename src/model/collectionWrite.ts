import { Collection } from "mongodb";
import { limitWrite } from "./utils";

/**
 * 向数据库中插入指定年份的源数据
 * @param database 数据库对象
 * @param data 要插入的数据
 * @param year 插入的年份
 */
export async function writeOfSource(collection: Collection, data: Array<any>) {

  // 重复创建索引是没有问题的
  await collection.createIndex({ number: 1 }, {
    unique: true
  });

  return limitWrite(collection, data, 1000, {
    ordered: false // 不排序以提高插入性能 see https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/index.html#db.collection.insertMany
  });

}

/**
 * 向指定集合写入新的专业模型
 */
export async function writeOfModel(collection: Collection, data: object) {
  return await collection.findOneAndReplace({}, data, {
    upsert: true
  });
}

/**
 * 向指定集合写入服务器开放时间
 */
export async function writeOfOpen(collection: Collection, startTime: string, endTime: string) {
  return await collection.updateOne({}, {
    $set:{
      'client.openTimeRange.startTime':startTime,
      'client.openTimeRange.endTime':endTime
    }
  });
}