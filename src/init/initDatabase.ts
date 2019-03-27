import { createCollection } from "../model/collectionCreate";
import { NODE_ENV } from "../types";
import { resolve } from "path";
import { Collection, Db, } from "mongodb";
import * as log4js from "log4js";

/**
 * 配置对象名称以及数据库对应的集合的名称映射
 */
export enum ConfigNameMap {
  'systemConfig' = 'configuration_static',
  'configuration_static' = 'systemConfig',
  'userConfig' = 'model_users',
  'model_users' = 'userConfig',
  'model_assets' = 'assetsConfig',
  'assetsConfig' = 'model_assets',
}

/**
 * 检测数据库中是否包含了给定名称的集合名称
 * @param databaseList 数据库列表
 * @returns 没有包含的数据库名称
 */
export function verifyDatabase(databaseList: Array<any>): Array<string> {

  const
    CollectionNames = [
      'configuration_static',
      'model_users',
      'model_assets'
    ],
    haveLossName = [];

  // 开发模式直接返回内容
  if (process.env.NODE_ENV === NODE_ENV.dev) {
    return CollectionNames;
  }

  let collectionNamesLen = CollectionNames.length;
  while (collectionNamesLen--) {
    let databaseListLen = databaseList.length;
    while (databaseListLen--) {
      if (databaseList[databaseListLen].name === CollectionNames[collectionNamesLen]) {
        break;
      }
    }
    if (databaseListLen === -1) {
      haveLossName.push(CollectionNames[collectionNamesLen])
    }
  }

  return haveLossName;
}

/**
 * 从指定的源路径中读取JSON数据
 * 然后存放到指定名称的数据库中的集合中
 * @param collectionNames 由集合名组成的数组
 * @param database 在该数据库中创建集合
 * @param filePath 存放源配置的路径
 */
export async function fillDatabase(collectionNames: Array<string>, database: Db, filePath: string, logger: log4js.Logger) {
  const pros = [];

  for (const name of collectionNames) {

    const JSONCONFIG = require(resolve(filePath, `${ConfigNameMap[name]}.json`));

    // 添加服务器启动时间戳
    if(name === ConfigNameMap['systemConfig']){
      JSONCONFIG['server']['lastTime'] = Date.now();
    }

    pros.push(createCollection(name, database, {
      insertData: JSONCONFIG,
      force: true
    }));

    logger.info(`${name} started rebuilding!`);
  }

  try {
    for (const item of pros) {

      const collection: Collection = await item;

      // 给用户账户添加唯一主键
      if (collection.collectionName === ConfigNameMap['userConfig']) {
        await collection.createIndex('account', {
          unique: true
        });
      }

    }
  } catch (error) {
    logger.error(`initialization Database failed, reason: ${error}`);
  }

}