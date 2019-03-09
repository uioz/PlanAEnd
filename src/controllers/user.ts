import { LevelCode, responseMessage, SystemErrorCode } from "../code";
import { Middleware, ErrorMiddleware, restrictResponse } from "../types";
import { readUserList } from "../model/collectionRead";
import { globalDataInstance } from "../globalData";
import * as apiCheck from "api-check";
import { responseAndTypeAuth } from "./public";


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
export interface PostShape{
  /**
   * 账户名称
   */
  account:string;
  /**
   * 用户昵称
   */
  nickname:string;
  /**
   * 用户权限2进制转10进制数值
   * 由于一共有6个权限位,所以二进制111111十进制表示63
   * 所以该数值被限制在了1-63闭区间中
   */
  level:number;
  /**
   * 密码SHA1格式
   */
  password:string;
  /**
   * 所管理的顶级区域
   */
  controlarea:Array<string>;
}

/**
 * 定义请求格式验证模板
 */
const postShape = apiCheck.shape({
  account: apiCheck.string,
  nickname: apiCheck.string,
  level: apiCheck.range(1, 63),
  password: apiCheck.string,
  controlarea: apiCheck.arrayOf(apiCheck.string)
});

/**
 * GET 对应的中间件
 */
export const MiddlewareOfGet: Array<Middleware> = [(request,response,next) => { 

  const collection = globalDataInstance.getMongoDatabase().collection(CollectionName);


  
  readUserList(collection).then(list => responseAndTypeAuth(response, {
    stateCode: 200,
    message: list
  }))
  .catch(error=>{

    responseAndTypeAuth(response,({
      stateCode:500,
      message:responseMessage['错误:服务器错误']
    }));

    (request as any).logger.error(SystemErrorCode['错误:数据库读取错误']);
    (request as any).logger.error(error);

  });
}];

/**
 * POST 对应的中间件
 */
export const MiddlewareOfPost: Array<Middleware> = [(request,response,next) => { 

  const 
    dataOfRequest:PostShape = request.body,
    badRequestResponse:restrictResponse = {
      stateCode: 400,
      message: responseMessage['错误:数据校验错误']
    };

  try {
    postShape(dataOfRequest);
  } catch (error) {

    // TODO 记录用户
    (request as any).logger.warn(`${SystemErrorCode['警告:数据校验错误']} Original data from user ${dataOfRequest}`);
    (request as any).logger.warn(error);

    return responseAndTypeAuth(response,badRequestResponse);
  }

  if(dataOfRequest.password.length !==40){
    (request as any).logger.error(`${SystemErrorCode['错误:密钥验证错误']} Original data from user ${dataOfRequest}`);
    return responseAndTypeAuth(response,badRequestResponse);
  }




}];
/**
 * Delete 对应的中间件
 */
export const MiddlewareOfDelete: Array<Middleware> = [(request,response,next) => { 
  response.end('ok');
}];
