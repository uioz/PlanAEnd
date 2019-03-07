import { LevelCode, responseMessage, SystemErrorCode } from "../code";
import { Middleware, ErrorMiddleware, restrictResponse } from "../types";
import { readUserList } from "../model/collectionRead";
import { globalDataInstance } from "../globalData";
/**
 * 简介:
 * 该模块负责用户信息的获取 GET
 * 该模块负责用户的添加 POST
 * 该模块负责用户的删除 DELETE
 * URL:
 * /user
 */

/**
 * 本模块对应的URL地址
 */
export const URL = '/user';

/**
 * GET 对应的权限下标
 */
export const LevelIndexOfGet = LevelCode.ManagementIndex.toString();
/**
 * POST 对应的权限下标
 */
export const LevelIndexOfPost = LevelCode.ManagementIndex.toString();
/**
 * DELETE 对应的权限下标
 */
export const LevelIndexOfDelete = LevelCode.ManagementIndex.toString();

/**
 * 本模块对应的集合名称
 */
export const CollectionName = 'model_users';

/**
 * GET 对应的中间件
 */
export const MiddlewareOfGet: Array<Middleware> = [(request,response,next) => { 

  const collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

  readUserList(collection).then(list => response.json({
    stateCode: 200,
    message: list
  } as restrictResponse))
  .catch(error=>{

    response.json({
      stateCode:500,
      message:responseMessage['错误:服务器错误']
    } as restrictResponse);

    (request as any).logger.error(SystemErrorCode['错误:数据库读取错误']);
    (request as any).logger.error(error);

  });
}];

/**
 * POST 对应的中间件
 */
export const MiddlewareOfPost: Array<Middleware> = [(request,response,next) => { 

  response.end('ok');
}];
/**
 * Delete 对应的中间件
 */
export const MiddlewareOfDelete: Array<Middleware> = [(request,response,next) => { 
  response.end('ok');
}];
