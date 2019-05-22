import { Response } from "express";
import { restrictResponse } from "../types";
import { responseMessage, SystemErrorCode } from "../code";
import { Logger } from "log4js";
import { Collection, FilterQuery } from "mongodb";
import { readOne } from "../model/collectionRead";

/**
 * 含有类型验证的JSON响应
 * **PS**:主要是懒得修改定义了
 * @param response express响应对象
 * @param responseData 响应的JSON数据
 */
export const responseAndTypeAuth = (response: Response, responseData: restrictResponse) => response.json(responseData);

/**
 * 定义了响应码的基本体
 */
const ResponseBodyCollection = {
  200: {
    stateCode: 200,
    message: responseMessage['数据上传成功']
  },
  400: {
    stateCode: 400,
    message: responseMessage['错误:数据校验错误']
  },
  500: {
    stateCode: 500,
    message: responseMessage['错误:服务器错误']
  }
}

/**
 * 含有响应码体的生成器
 * @param code 状态码
 */
const GeneratorCodeResponse = (code: number) => {
  return (response: Response, message?: responseMessage) => {
    if (message) {
      return responseAndTypeAuth(response, Object.assign({}, ResponseBodyCollection[code], { message }));
    } else {
      return responseAndTypeAuth(response, ResponseBodyCollection[code]);
    }
  }
}

/**
 * 响应500状态码
 * @param response express响应对象
 * @param message 响应的文本内容 默认为服务器错误
 */
export const code500 = GeneratorCodeResponse(500);

/**
 * 响应400状态码
 * @param response express响应对象
 * @param message 响应的消息 默认为数据校验错误
 */
export const code400 = GeneratorCodeResponse(400);

/**
 * 响应200状态码
 * @param response express响应对象
 * @param message 响应的消息 默认为数据上传成功
 */
export const code200 = GeneratorCodeResponse(200);

/**
 * 记录400错误
 * @param logger log4js-logger实例
 * @param data 用户请求的数据
 * @param message 系统内部使用的错误码
 * @param error 错误对象或者含有错误信息的对象
 */
export const logger400 = (logger: Logger, data: object, message: SystemErrorCode = SystemErrorCode['警告:数据校验错误'], error?: Error) => {
  logger.warn(`${message} Original data from user ${JSON.stringify(data)}`);
  if (error) {
    logger.warn(error);
  }
}

/**
 * 记录500错误
 * @param logger log4js-logger实例
 * @param data 用户请求的数据
 * @param message 系统内部使用的错误码
 * @param error 错误对象或者含有错误信息的对象
 */
export const logger500 = (logger: Logger, data?: object, message: SystemErrorCode = SystemErrorCode['错误:数据库读取错误'], error?: Error | object) => {
  if (message) {
    logger.error(`${message} Original data from user ${JSON.stringify(data)}`);
  }
  if (error) {
    logger.error(error);
  }
}


/**
 * 自动读取指定的集合自动记录错误只会返回获取到的结果
 * @param collection 集合对象
 * @param response 响应对象
 * @param logger 记录对象
 * @param data 用户传入的对象
 */
export async function autoReadOne(collection: Collection, response: Response, logger: Logger, data?: any) {

  try {
    return await readOne(collection);
  } catch (error) {
    code500(response);
    logger500(logger, data, undefined, error);
  }

}

/**
 * public.autoReadOne的允许find版本
 * @param collection 集合对象
 * @param filter 查询器
 * @param response 响应对象
 * @param logger log4js实例
 * @param data 用户上传的数据
 */
export async function autoFindOne(collection: Collection, filter: FilterQuery<never>, response: Response, logger: Logger, data?: any) {
  try {
    return await readOne(collection, filter)
  } catch (error) {
    code500(response);
    logger500(logger, data, undefined, error);
  }
}

/**
 * 1. 根据给定的数据和给定的键来获取内容然后判断数据是否存在
 * 2. 利用给定的操作符号来返回不同的更新条件语句
 * 
 * 抛出的错误:
 * - 给定的源数据上不存在指定的键
 * - 非法的操作类型
 * @param operation 更新操作的类型
 * @param OriginalData 数据库中原来的数据
 * @param value 操作对应的数据
 * @param keys 由键组成的数组
 */
export const deepUpdate = (operation: string, OriginalData: any, value: any, ...keys: Array<string>) => {

  let node = OriginalData;
  for (const key of keys) {
    node = node[key];
  }

  switch (operation) {
    case 'alter':
      return {
        $set: {
          [keys.join('.')]: value
        }
      }
    case 'push':
      if (Array.isArray(value)) {
        return {
          $addToSet: {
            [keys.join('.')]: {
              $each: value
            }
          }
        }
      }
      return {
        $addToSet: {
          [keys.join('.')]: value
        }
      }
    case 'pull':
      return {
        $pullAll: {
          [keys.join('.')]: value
        }
      }
    default:
      throw new Error(`No such operation as ${operation}`);
  }
}

export async function collectionRead(collection: Collection) {
  return await collection.findOne({}, {
    projection: {
      _id: 0
    }
  });
}

export async function collectionWrite(collection: Collection, data: object) {
  return await collection.updateOne({}, {
    $set: {
      ...data
    }
  });
}