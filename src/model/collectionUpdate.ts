import { Collection } from "mongodb";
import { PostShape } from "../controllers/user";

/**
 * 更新用户信息(不包括帐号)
 * @param collection 集合对象
 * @param data 用户数据
 */
export async function updateOfUser(collection: Collection, data: PostShape) {

  const account = data.account;

  return await collection.updateOne({
    account
  } as PostShape, {
      $set: {
        ...data
      }
    }, {
      upsert: true
    });
}