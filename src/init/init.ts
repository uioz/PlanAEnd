import { Db } from "mongodb";
import * as Fs from "fs";
import { resolve } from "path";
import { configTree } from "../types";
import { GlobalData } from "../globalData";
import * as log4js from "log4js";
import { hidden_id } from "../model/utils";

/**
 * 获取给定目录的所有内容, 保存未一个树状结构, 该函数被设计用来读取目录下的 JSON 和 JS 文件.  
 * {
 *  '文件名称':[文件内容],
 *  '文件名称':[文件内容],
 * }
 * @param configsDirectory 静态配置文件暂存的目录
 */
export async function getAllConfig(configsDirectory: string): configTree{

  const configTree = {};

  for (const fileName of (await Fs.promises.readdir(configsDirectory))) {
    configTree[fileName] = require(resolve(configsDirectory, fileName));
  }

  return configTree;
}

/**
 * 判断给定名称的集合是否存在于数据库中
 * @param database 数据库
 * @param collectionName 集合名称
 */
export async function colletionIsExist(database: Db, collectionName: string) {
  return (await database.collection(collectionName).stats()).ok === 1;
}

/**
 * 利用给定的静态配置文件来重建数据库.  
 * 配置文件格式如下所示:
 * {
 *  '集合名称':{}, // 对应的静态配置文件
 *  '集合名称':{}, // 对应的静态配置文件
 * }
 * @param globalData 全局共用的实例
 * @param config 由多个静态配置组成的配置文件
 */
export async function toRebuildCollectionUseConfigs(globalData:GlobalData,configs: object) {

  const
    database = globalData.getMongoDatabase(),
    mode = globalData.mode;

  let 
    configKeys = Object.keys(configs),
    configListForRebuild = [];

  // 根据不同模式过滤需要插入到数据库中的集合名称
  if (mode === 'production') {
    
    for (const collectionName of configKeys) {
      
      if(!colletionIsExist(database,collectionName)){
        configListForRebuild.push(collectionName);
      }

    }

  } else { // === development

    configListForRebuild = configKeys;

  }

  // 利用过滤后的内容集合插入到数据库中
  // **注意**:无视插入错误
  for (const collectionName of configListForRebuild) {

    if(Array.isArray(configKeys[collectionName])){
      await database.collection(collectionName).insertMany(configs[collectionName],{
        ordered:false
      });
    }else{
      await database.collection(collectionName).insertOne(configs[collectionName]);
    }

  }

}

/**
 * 自动根据当前运行的模式来获取对应的 logger.  
 * **注意**:调用本函数之前, globalData 必须已经导入了 log4js 实例. 
 * @param globalData 全局共用对象
 */
export function initLog4js(globalData:GlobalData) {

  // 创建 log4js 实例, 并且挂载到全局对象上
  const Log = log4js.configure(globalData.getConfig('log_static'));
  globalData.setLog4js(Log);

  let logger;

  if (globalData.mode === 'production'){
    logger = Log.getLogger('production');
  }else{ // === development
    logger = Log.getLogger('developmentOnlySystem');
  }

  logger.info('switch logger to log4js.');

  return logger;

}

/**
 * 将超级管理员账户读取到全局变量中保存,为后面鉴权使用
 * @param globalData 全局共用对象
 */
export async function toSetSuperUserAccountOfGlobalData(globalData:GlobalData) {

  const database = globalData.getMongoDatabase();

  const result = await database.collection('model_users').findOne({
    level: 0
  }, hidden_id);

  if(result){
    
  }

  throw new Error(`Can't find account of superUser, please check your static config which named model_users !`);

}


