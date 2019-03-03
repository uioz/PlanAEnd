import { LevelCode, responseMessage, ResponseErrorCode } from "../code";
import { Middleware, restrictResponse, ErrorMiddleware } from "../types";
import { globalDataInstance } from "../globalData";
import { collectionReadAllIfHave } from "../model/collectionRead";
import * as bodyParser from "body-parser";

/**
 * 使用body-paser定义JSON解析中间件
 */
const JSONParser = bodyParser.json({
  inflate: true, // 自动解压
  limit: '100kb', // JSON大小上限
  strict: true,// 只允许合法JSON通过
  type: 'application/json', //MIME类型
});


/**
 * 简介:
 * 本模块用于管理专业模型的获取和修改
 * /model
 */

/**
 * 本模块对应的URL地址
 */
export const URL = '/model';
/**
 * GET 对应的权限下标(不需要权限)
 */
export const LevelIndexOfGet = '';

/**
 * POST 对应的权限下标
 */
export const LevelIndexOfPost = LevelCode.EditIndex.toString();
/**
 * 数据库名称
 */
export const DatabaseName = 'model_speciality';

/**
 * GET 对应的中间件
 */
export const MiddlewaresOfGet: Array<Middleware> = [
  (request, response, next) => {

    // 此时通过的请求都是经过session验证的请求
    // 此时挂载了logger 和 express-session 中间件

    const collection = globalDataInstance.getMongoDatabase().collection(DatabaseName);

    collectionReadAllIfHave(collection)
      .then(result => {

        if (result) {

          return response.json({
            message: result,
            stateCode: 200
          } as restrictResponse);

        } else {
          return response.json({
            message: responseMessage['错误:暂无数据'],
            stateCode: 400
          } as restrictResponse)
        }

      })
      .catch(error => {

        (request as any).logger.error(error.stack);

        return response.json({
          stateCode: 500,
          message: responseMessage['错误:服务器错误']
        } as restrictResponse);

      });

  }
]

/**
 * POST 对应的中间件
 */
export const MiddlewaresOfPost: Array<Middleware | ErrorMiddleware> = [
  JSONParser,
  (error, request, response, next) => {

    // 记录错误栈
    (request as any).logger.error(error);
    return next(ResponseErrorCode['错误:数据校验错误']);

  },(request,response,next)=>{

    // TODO 编写 模型正则过滤,长度过滤,底部数组过滤

    response.end('ok')
  }
]
