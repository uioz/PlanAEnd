import { LevelCode, responseMessage, SystemErrorCode } from "../code";
import { Middleware, ErrorMiddleware, restrictResponse } from "../types";
import { readUserList } from "../model/collectionRead";
import { globalDataInstance } from "../globalData";
import * as apiCheck from "api-check";
import { responseAndTypeAuth, JSONParser, code500, code400, code200, logger400 } from "./public";
import { writeOfUser } from "../model/collectionWrite";
import { Logger } from "log4js";


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
 * 该接口描述了POST请求用户传递内容数据的类型
 */
export interface PostShape {
  /**
   * 账户名称
   */
  account: string;
  /**
   * 用户昵称
   */
  nickname?: string;
  /**
   * 用户权限2进制转10进制数值
   * 由于一共有6个权限位,所以二进制111111十进制表示63
   * 所以该数值被限制在了1-63闭区间中
   */
  level?: number;
  /**
   * 密码SHA1格式
   */
  password?: string;
  /**
   * 所管理的顶级字段
   */
  controlarea?: Array<string>;
}

/**
 * 定义请求格式验证模板
 */
const postShape = apiCheck.shape({
  account: apiCheck.string,
  nickname: apiCheck.string.optional,
  level: apiCheck.range(1, 63).optional,
  password: apiCheck.string.optional,
  controlarea: apiCheck.arrayOf(apiCheck.string).optional
}).strict;

/**
 * 定义删除验证模板
 */
const deleteShape = apiCheck.shape({
  account:apiCheck.string
}).strict;

/**
 * GET 对应的中间件
 */
export const MiddlewareOfGet: Array<Middleware> = [(request, response, next) => {

  const collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

  readUserList(collection).then(list => responseAndTypeAuth(response, {
    stateCode: 200,
    message: list
  }))
    .catch(error => {
      (request as any).logger.error(SystemErrorCode['错误:数据库读取错误']);
      (request as any).logger.error(error);
      return code500(response);
    });
}];

/**
 * POST 对应的中间件
 */
export const MiddlewareOfPost: Array<Middleware> = [JSONParser, (request, response) => {

  const result = postShape(request.body);
  if (result instanceof Error) {
    // TODO 记录用户
    logger400((request as any).logger,request.body,undefined,result);
    return code400(response);
  }
}, (request, response) => {

  const dataOfRequest: PostShape = request.body;

  // SHA1加密后的密钥长度为40位
  if (dataOfRequest.password) {
    if (dataOfRequest.password.length !== 40) {
      logger400((request as any).logger, dataOfRequest, SystemErrorCode['错误:密钥验证错误']);
      return code400(response);
    }
  }

  const collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

  writeOfUser(collection, dataOfRequest).then(writeReaponse => {

    if (writeReaponse.result.ok) {
      return code200(response);
    } else {
      (request as any).logger.error(SystemErrorCode['错误:数据库写入失败']);
      return code500(response);
    }

  })
    .catch(error => {
      (request as any).logger.error(SystemErrorCode['错误:数据库写入失败']);
      (request as any).logger.error(error);
      return code500(response);
    });

}];
/**
 * Delete 对应的中间件
 */
export const MiddlewareOfDelete: Array<Middleware> = [(request,response,next)=>{
  const 
    DataOfRequest = request.body,
    result = deleteShape(DataOfRequest);

    // TODO 等待编写

  if(result instanceof Error){
    logger400((request as any).logger,DataOfRequest,undefined,result);
    return code400(response);
  }



},(request, response, next) => {
  response.end('ok');
}];
