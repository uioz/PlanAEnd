"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const code_1 = require("../code");
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
