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


/**
 * 专业模型结构同步到通知模型结构函数
 * **注意**:这个函数要先于removeRedundancyOnNotcieModel函数执行
 * @param specialityModel 专业模型
 * @param noticeModel 通知模型
 */
export const noticelSyncSpeciality = (specialityModel: Object, noticeModel) => {

  const padding = name => {
    return {
      name,
      title: '',
      notice: '',
      lists: []
    }
  },
    notKeyInNotice = (name: string, noticeModel: Array<any>) => noticeModel.findIndex(value => value.name === name);

  const core = (specialityModel: Object | Array<any>, noticeModel: Array<any>) => {
    // 遇到了结果集合,这里的名称都是最后用户可以被选择的专业名字
    if (Array.isArray(specialityModel)) {
      for (const FinalSpecialityName of specialityModel) {
        // 只有当数组中不存在名称相同的时候才会插入这个内容
        if(notKeyInNotice(FinalSpecialityName,noticeModel) === -1){
          noticeModel.push(padding(FinalSpecialityName));
        }
      }
      return;
    }

    for (const SpecialityModelName of Object.keys(specialityModel)) {

      const index = notKeyInNotice(SpecialityModelName,noticeModel);

      // 如果通知模型上不存在对于的键,则创建它
      if (index === -1) {
        const pad = padding(SpecialityModelName);
        noticeModel.push(pad);
        // 递归调用
        core(specialityModel[SpecialityModelName], pad.lists);
      }else{
        core(specialityModel[SpecialityModelName], noticeModel[index].lists);
      }
    }

    return noticeModel;
  }

  return core(specialityModel, noticeModel);

}

/**
 * 以专业模型为基准去除通知模型上多余的内容
 * @param noticeModel 通知模型
 * @param specialityModel 专业模型
 */
const removeRedundancyOnNotcieModel = (noticeModel: Array<any>, specialityModel: Object) => {

  const
    pullAt = (array: Array<any>, index: number) => array.splice(index, 1),
    isFinalResult = data => !data.lists.length;

  const core = (noticeModel: Array<any>, specialityModel: Object | Array<any>, ) => {

    let len = noticeModel.length;

    while (len--) {

      const
        noticeModelNode = noticeModel[len],
        nodeNameFromNoticeModel = noticeModelNode.name;

      // 如果是是结果节点
      if (isFinalResult(noticeModelNode)) {
        // 如果该通知节点不在专业模型结果集合中存在
        if ((specialityModel as Array<any>).findIndex(result => result === nodeNameFromNoticeModel) === -1) {
          // 移除它
          pullAt(noticeModel, len);
        }

      } else if (noticeModelNode.name in specialityModel) {// 如果存在则递归进入
        core(noticeModelNode.lists, specialityModel[nodeNameFromNoticeModel]);
      } else {
        // 如果是父节点不存在则删除这个通知节点
        pullAt(noticeModel, len);
      }

    }

  }

  core(noticeModel, specialityModel);

  return noticeModel;

}

/**
 * 利用专业模型将给定的集合对象修整为符合专业模型约束的通知模型
 * @param noticeCollection 通知模型集合对象
 * @param specialityCollection 专业模型集合对象
 * @param noticeModelNode 通知模型对象
 */
export async function updateOfNoticeModelInAssets(noticeCollection: Collection, specialityCollection: Collection, noticeModelNode:Array<any>) {

  const specialityModel = await readOne(specialityCollection);

  const
    syncedNoticeModel = noticelSyncSpeciality(specialityModel, noticeModelNode),
    correctNoticeModel = removeRedundancyOnNotcieModel(syncedNoticeModel, specialityModel);
  
  return await noticeCollection.updateOne({},{
    $set:{
      speciality: correctNoticeModel
    }
  },{
    upsert:true
  });

}

/**
 * 利用给定的专业模型来更新通知模型
 * @param collection collection对象
 * @param specialityModel 专业模型对象
 */
export async function updateOfNoticeModelInModel(collection: Collection, specialityModel: Array<any>) {

  const { speciality: noticeModel } = await readOne(collection);

  const
    syncedNoticeModel = noticelSyncSpeciality(specialityModel, noticeModel),
    correctNoticeModel = removeRedundancyOnNotcieModel(syncedNoticeModel, specialityModel);

  return await collection.updateOne({}, {
    $set: {
      'speciality': correctNoticeModel
    }
  }, { upsert: true });

}
