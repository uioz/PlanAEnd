"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const globalData_1 = require("../globalData");
const source_1 = require("./source");
const collectionRead_1 = require("../model/collectionRead");
/**
 * 说明:
 * /source/json/:year/:start/to/:end
 * 以JSON形式获取源数据
 */
/**
 * 本文件中的路由地址
 */
exports.URL = '/source/json/:year/:start/to/:end';
/**
 * GET下对应的权限下标
 */
exports.LevelIndexOfGet = code_1.LevelCode.View.toString();
exports.MiddlewaresOfGet = [(request, response) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
        const year = parseInt(request.params.year), start = parseInt(request.params.start), end = parseInt(request.params.end);
        if (source_1.checkNumber(year) && source_1.checkNumber(start) && source_1.checkNumber(end)) {
            collectionRead_1.readOfRangeEasy(globalData_1.globalDataInstance.getMongoDatabase().collection(source_1.DatabasePrefixName + year), start, end, { number: 1 }).then(result => response.json({
                stateCode: 200,
                message: result,
            })).catch(error => {
                request.logger.error(error.stack);
                return response.json({
                    stateCode: 500,
                    message: code_1.responseMessage['错误:服务器错误'],
                });
            });
        }
        else {
            return response.json({
                message: code_1.responseMessage['错误:地址参数错误'],
                stateCode: 400
            });
        }
    }];
