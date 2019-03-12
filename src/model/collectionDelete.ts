import { Collection } from "mongodb";

/**
 * 从指定的用户集合删除指定的用户
 * @param collection 集合对象
 * @param account 账户名称
 */
export async function deleteOfUser(collection:Collection,account:string) {
  return await collection.deleteMany({
    account
  });
}