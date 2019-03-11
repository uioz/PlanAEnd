import { Response } from "express";
import { restrictResponse } from "../types";
import * as bodyParser from "body-parser";
import { responseMessage, SystemErrorCode } from "../code";
import { Logger } from "log4js";

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
  200:{
    stateCode:200,
    message:responseMessage['数据上传成功']
  },
  400:{
    stateCode:400,
    message:responseMessage['错误:数据校验错误']
  },
  500:{
    stateCode:500,
    message:responseMessage['错误:服务器错误']
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
 * 使用body-paser定义JSON解析中间件
 */
export const JSONParser = bodyParser.json({
  inflate: true, // 自动解压
  limit: '100kb', // JSON大小上限
  strict: true,// 只允许合法JSON通过
  type: 'application/json', //MIME类型
});

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
 * @param message 系统内部使用的错误码
 * @param data 用户请求的数据
 * @param error 错误的内容
 */
export const logger400 = (logger: Logger, data: object, message: SystemErrorCode = SystemErrorCode['警告:数据校验错误'],error?:Error) => {
  logger.warn(`${message} Original data from user ${JSON.stringify(data)}`);
  if(error){
    logger.warn(error);
  }
}
