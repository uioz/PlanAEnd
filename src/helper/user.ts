import { Collection } from "mongodb";
import { ParsedSession } from "../types";

abstract class BaseUser {

  protected userId: string;
  protected collection: Collection;

  public setUserId(userId: string) {

    this.userId = this.userId;

    return this;
  }

  public setCollection(collection: Collection) {

    this.collection = collection;

    return this;

  }

}

export class GetUser extends BaseUser {

  private userInfo: ParsedSession;

  constructor(userId?: string, collection?: Collection) {

    super();

    if (userId) {
      this.userId = userId;
    }

    if (collection) {
      this.collection = collection;
    }

  }

  public setUserId(userId: string) {
    this.userId = this.userId;
    return this;
  }

  public setCollection(collection: Collection) {

    if (this.collection && this.userInfo) {
      this.collection = this.userInfo = null;
    }

    return super.setCollection(collection);
  }

  private sameUserId(userId: string) {
    return userId === this.userId ? true : false;
  }

  public async getInfo(userId?: string) {

    userId = userId ? userId : this.userId;

    if (!userId) {
      throw new Error(`GetUser haven't got userId`)
    }

    if (this.sameUserId(userId) && this.userInfo) {
      return this.userInfo;
    }

    const result = await this.collection.findOne({
      _id: userId
    }, {
        projection: {
          password: false,
          lastlogintime: false
        }
      });

    result.userid = result._id;
    delete result._id;

    this.userInfo = result;

    return this.userInfo;

  }

}

// GetUser 全局单例
let GetUserInstance: GetUser;

/**
 * 获取一个用于读取用户信息的工具类, 这个函数返回这个类的全局单例
 * @param userId 用户id
 * @param collection 用户所在的集合
 */
export function GetUserI(userId?: string, collection?: Collection) {

  if (GetUserInstance) {

    if (userId) {
      GetUserInstance.setUserId(userId);
    }

    if (collection) {
      GetUserInstance.setCollection(collection);
    }

    return GetUserInstance;

  } else {
    GetUserInstance = new GetUser(userId, collection);
    return GetUserInstance;
  }

}

async function userExist(collection: Collection, userId: string) {
  return !!(await collection.findOne({
    _id: userId
  }));
}

/**
 * 设置用户信息, 承担两种功能:
 * 1. 如果用户 id 存在则更新
 * 2. 如果用户不存在则 data 中至少包含 account 和 password 还有 nickname 然后创建一个新的用户
 * **注意**: 该函数只会检测内容是否存在, 至于内容是否符合要求这部分需要在本函数外部验证
 * @param collection 用户信息所在的集合
 * @param data 要更新的数据
 */
export async function setUser(collection: Collection, data: ParsedSession) {

  const
    padding: ParsedSession = {
      controlarea: [],
      level: 63,
      levelcoderaw: '0111111',
      lastlogintime: Date.now()
    },
    { userid: userId, ...rest } = data;

  if (await userExist(collection, userId)) {

    return collection.updateOne({
      _id: userId
    }, rest)

  } else if (rest.account && rest.password && rest.nickname) {

    return collection.insertOne(Object.assign(padding, rest))

  } else {
    throw new Error(`Data must have filed of account if it Non-existent in collection`)
  }

}