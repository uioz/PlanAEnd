"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const code_1 = require("../code");
const collectionRead_1 = require("../model/collectionRead");
/**
 * 含有类型验证的JSON响应
 * **PS**:主要是懒得修改定义了
 * @param response express响应对象
 * @param responseData 响应的JSON数据
 */
exports.responseAndTypeAuth = (response, responseData) => response.json(responseData);
/**
 * 定义了响应码的基本体
 */
const ResponseBodyCollection = {
    200: {
        stateCode: 200,
        message: code_1.responseMessage['数据上传成功']
    },
    400: {
        stateCode: 400,
        message: code_1.responseMessage['错误:数据校验错误']
    },
    500: {
        stateCode: 500,
        message: code_1.responseMessage['错误:服务器错误']
    }
};
/**
 * 含有响应码体的生成器
 * @param code 状态码
 */
const GeneratorCodeResponse = (code) => {
    return (response, message) => {
        if (message) {
            return exports.responseAndTypeAuth(response, Object.assign({}, ResponseBodyCollection[code], { message }));
        }
        else {
            return exports.responseAndTypeAuth(response, ResponseBodyCollection[code]);
        }
    };
};
/**
 * 使用body-paser定义JSON解析中间件
 */
exports.JSONParser = bodyParser.json({
    inflate: true,
    limit: '100kb',
    strict: true,
    type: 'application/json',
});
/**
 * 响应500状态码
 * @param response express响应对象
 * @param message 响应的文本内容 默认为服务器错误
 */
exports.code500 = GeneratorCodeResponse(500);
/**
 * 响应400状态码
 * @param response express响应对象
 * @param message 响应的消息 默认为数据校验错误
 */
exports.code400 = GeneratorCodeResponse(400);
/**
 * 响应200状态码
 * @param response express响应对象
 * @param message 响应的消息 默认为数据上传成功
 */
exports.code200 = GeneratorCodeResponse(200);
/**
 * 记录400错误
 * @param logger log4js-logger实例
 * @param data 用户请求的数据
 * @param message 系统内部使用的错误码
 * @param error 错误对象或者含有错误信息的对象
 */
exports.logger400 = (logger, data, message = code_1.SystemErrorCode['警告:数据校验错误'], error) => {
    logger.warn(`${message} Original data from user ${JSON.stringify(data)}`);
    if (error) {
        logger.warn(error);
    }
};
/**
 * 记录500错误
 * @param logger log4js-logger实例
 * @param data 用户请求的数据
 * @param message 系统内部使用的错误码
 * @param error 错误对象或者含有错误信息的对象
 */
exports.logger500 = (logger, data, message = code_1.SystemErrorCode['错误:数据库读取错误'], error) => {
    if (message) {
        logger.error(`${message} Original data from user ${JSON.stringify(data)}`);
    }
    if (error) {
        logger.error(error);
    }
};
/**
 * 自动读取指定的集合自动记录错误只会返回获取到的结果
 * @param collection 集合对象
 * @param response 响应对象
 * @param logger 记录对象
 * @param data 用户传入的对象
 */
async function autoReadOne(collection, response, logger, data) {
    try {
        return await collectionRead_1.readOne(collection);
    }
    catch (error) {
        exports.code500(response);
        exports.logger500(logger, data, undefined, error);
    }
}
exports.autoReadOne = autoReadOne;
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
exports.deepUpdate = (operation, OriginalData, value, ...keys) => {
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
            };
        case 'push':
            if (Array.isArray(value)) {
                return {
                    $addToSet: {
                        [keys.join('.')]: {
                            $each: value
                        }
                    }
                };
            }
            return {
                $addToSet: {
                    [keys.join('.')]: value
                }
            };
        case 'pull':
            return {
                $pullAll: {
                    [keys.join('.')]: value
                }
            };
        default:
            throw new Error(`No such operation as ${operation}`);
    }
};
