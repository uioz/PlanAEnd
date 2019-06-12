import { Collection, ObjectID } from "mongodb";
import { ParsedSession } from "../types";

type UserStructure = Required<ParsedSession>;

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

  public async getInfo(userId?: string, projection: object = {
    password: false,
    lastlogintime: false
  }) {

    userId = userId ? userId : this.userId;

    if (!userId) {
      throw new Error(`GetUser haven't got userId`)
    }

    if (this.sameUserId(userId) && this.userInfo) {
      return this.userInfo;
    }

    const result = await this.collection.findOne(
      {
        _id: new ObjectID(userId)
      },
      {
        projection
      }
    );

    // 将数据库中的 _id 转为 userid
    result.userid = result._id + '';
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

function userExist(collection: Collection, userId: string): Promise<UserStructure>{
  return collection.findOne({
    _id: new ObjectID(userId)
  });
}

/**
 * 设置用户信息, 承担两种功能:
 * 1. 如果用户 id 存在则更新
 * 2. 如果用户不存在则 data 中至少包含 account 和 password 还有 nickname 然后创建一个新的用户
 * **注意**: 该函数只会检测内容是否存在, 至于内容是否符合要求这部分需要在本函数外部验证
 * @param collection 用户信息所在的集合
 * @param data 要更新的数据
 */
export async function setUser(collection: Collection, data: ParsedSession): Promise<UserStructure|false> {

  const
    padding: ParsedSession = {
      controlarea: [],
      level: 63,
      levelcoderaw: '1111111',
      lastlogintime: Date.now(),
    },
    { userid: userId, ...rest } = data;

  const userInfo = await userExist(collection, userId);

  if (!!userInfo) {

    const updateResult = await collection.updateOne({
      _id: new ObjectID(userId)
    }, {
        $set: {
          ...rest
        }
      })

    
    if(updateResult.modifiedCount){ // 如果修改了内容返回用户信息
      return Object.assign(userInfo,rest); // 将新的信息合并到旧的数据上
    }else{
      return false;
    }

  } else if (rest.account && rest.password && rest.nickname) { // 没有 userid 则视为创建用户

    const newUserData: UserStructure = Object.assign(padding, rest) as any

    const insertedResult = await collection.insertOne(newUserData);

    if (insertedResult.insertedCount){
      return newUserData;
    }else{
      return false;
    }


  } else {
    throw new Error(`Data must have filed of account if it Non-existent in collection`)
  }

}