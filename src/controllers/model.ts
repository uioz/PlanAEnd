import { LevelCode, responseMessage, ResponseErrorCode, SystemErrorCode } from "../code";
import { Middleware, restrictResponse, ErrorMiddleware } from "../types";
import { globalDataInstance } from "../globalData";
import { collectionReadAllIfHave } from "../model/collectionRead";
import * as bodyParser from "body-parser";
import { writeOfModel } from "../model/collectionWrite";
import { responseAndTypeAuth } from "./public";

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
export const CollectionName = 'model_speciality';

/**
 * GET 对应的中间件
 */
export const MiddlewaresOfGet: Array<Middleware> = [
  (request, response, next) => {

    // 此时通过的请求都是经过session验证的请求
    // 此时挂载了logger 和 express-session 中间件

    const collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

    collectionReadAllIfHave(collection)
      .then(result => {

        if (result) {

          return responseAndTypeAuth(response, {
            message: result,
            stateCode: 200
          });

        }

        return responseAndTypeAuth(response, {
          message: responseMessage['错误:暂无数据'],
          stateCode: 400
        });

      })
      .catch(error => {

        (request as any).logger.error(error.stack);

        return responseAndTypeAuth(response, {
          stateCode: 500,
          message: responseMessage['错误:服务器错误']
        });
      });

  }
]

const patternOfData = new RegExp(`^[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FBF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\\w]{1,10}$`);

/**
 * 递归数据检测上传的专业模型是否符合规范
 * **注意**:一旦检测到错误会抛出异常
 * @param data 要被检测的数据
 */
const checkBody = (data: any) => {
  if (Array.isArray(data)) {
    for (const item of data) {
      if (!patternOfData.test(item)) {
        throw new Error(`The ${item} of element of Array unable to pass verify.`);
      }
    }
    return;
  }

  for (const key of Object.keys(data)) {
    if (patternOfData.test(key)) {
      if (typeof data[key] === 'object') {
        checkBody(data[key]);
      } else {
        throw new Error(`The Object-value ${data[key]} type is not object or array`);
      }

    } else {
      throw new Error(`The Object-key ${key} unable to pass verify.`);
    }
  }
}

/**
 * POST 对应的中间件
 */
export const MiddlewaresOfPost: Array<Middleware | ErrorMiddleware> = [
  JSONParser,
  (error, request, response, next) => {

    // 记录错误栈
    (request as any).logger.error(error);
    return next(responseMessage['错误:数据校验错误']);

  }, (request, response, next) => {

    try {

      const SourceData = request.body;

      checkBody(SourceData);

      writeOfModel(globalDataInstance.getMongoDatabase().collection(CollectionName), SourceData)
        .then(result => {
          if(!result.ok){
            request.logger.warn(`${SystemErrorCode['错误:数据库回调异常']} ${result}`);
          }
        })
        .catch(error => {
          request.logger.error(error);
          request.logger.error(SystemErrorCode['错误:数据库写入失败']);
        });

      return responseAndTypeAuth(response, {
        stateCode: 200,
        message: responseMessage['数据上传成功']
      });

    } catch (error) {
      // TODO 记录用户
      request.logger.error(error);

      return responseAndTypeAuth(response, {
        stateCode: 400,
        message: responseMessage['错误:数据校验错误']
      });
    }

  }
]
