import { Collection } from "mongodb";
import { PostShape } from "../controllers/user";
import { readOne } from "./collectionRead";

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

export async function updateOfAssets(collection: Collection, specialityModel: any) {

  const
    noticeModel = await readOne(collection),
    padding = name => {
      return {
        name,
        title: '',
        notice: '',
        lists: []
      }
    },
    notKeyInNotice = (title: string, noticeModel: Array<any>) => noticeModel.findIndex(value => value.title === title) === -1;

  /**
   * 返回一个新的对象(TODO 深克隆),
   * 这个函数的流程是以左边的专业模型为基准来判断右边的通知模型是否存在对应的键.
   * 然后执行相应的逻辑.
   * @param specialityModel 专业模型
   * @param noticeModel 通知模型
   * @param result 挂载数据的新对象
   */
  function pickle(specialityModel, noticeModel) {

    // 遇到了结果集合,这里的名称都是最后用户可以被选择的专业名字
    if(Array.isArray(specialityModel)){
      for (const FinalSpecialityName of specialityModel) {
        noticeModel.push(padding(FinalSpecialityName));
      }
      return ;
    }

    for (const SpecialityModelName of specialityModel) {
      // 如果通知模型上不存在对于的键,则创建它
      if(notKeyInNotice(SpecialityModelName,noticeModel)){

        const pad = padding(SpecialityModelName);
        noticeModel.push(padding(SpecialityModelName));

        // 递归调用
        pickle(specialityModel[SpecialityModelName],pad.lists)


      }
    }

    return noticeModel;

  }



}