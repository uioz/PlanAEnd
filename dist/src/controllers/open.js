"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const express_1 = require("express");
const public_1 = require("./public");
const apiCheck = require("api-check");
const collectionWrite_1 = require("../model/collectionWrite");
/**
 * 简介:
 * 该模块负责服务器开闭管理
 * 顶级URL为/open
 * 本模块导出的是模块化路由
 * 该路由下有多个子路径
 */
/**
 * 本模块使用的集合名称
 */
exports.CollectionName = 'configuration_static';
/**
 * POST对应的权限下标
 */
exports.LevelIndexOfPost = code_1.LevelCode.SuperUserIndex.toString();
/**
 * 请求请求格式验证模板
 */
const postShape = apiCheck.shape({
    startTime: apiCheck.string,
    endTime: apiCheck.string,
}).strict;
exports.addRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {
    const router = express_1.Router(), collection = globalDataInstance.getMongoDatabase().collection(exports.CollectionName), verify = verifyMiddleware(exports.LevelIndexOfPost);
    router.get('/open/range', SessionMiddleware, LogMiddleware, (request, response, next) => {
        public_1.autoReadOne(collection, response, request.logger).then(({ client }) => {
            public_1.responseAndTypeAuth(response, {
                stateCode: 200,
                message: Object.assign({}, client.openTimeRange)
            });
        })
            .catch((error) => {
            public_1.logger500(request.logger, undefined, undefined, error);
            public_1.code500(response);
        });
    });
    router.post('/open/range', SessionMiddleware, verify, LogMiddleware, public_1.JSONParser, (request, response, next) => {
        const requestBody = request.body, checkResult = postShape(requestBody);
        if (checkResult instanceof Error) {
            public_1.logger400(request.logger, requestBody, undefined, checkResult);
            return public_1.code400(response);
        }
        // 时间是一个ISO8601格式的字符串
        // 使用new Date().toJSON
        // 或者使用new Date().toISOString()生成
        // 使用这两种方式javascript会根据当前地区时间
        // 以格林威治时间0时区为基准进行计算生成符合
        // ISO8601的时间并且时区偏移是0
        // 这里时间存在的意义是进行大小比对,所以不在意
        // 具体时区,这样一来计算时间的时候不用考虑服务器
        // 所运行环境中的时区偏移
        // Date.parse解析时间正确返回日期对象错误返回NaN
        // 但是javascript中NaN!==NaN所以需要借助于ES6的Number.isNaN方法
        const { startTime, endTime } = requestBody, startDate = Date.parse(startTime), endDate = Date.parse(endTime);
        // 时间错误或者给定的起始时间大于等于结束时间则错误
        if (Number.isNaN(startDate) || Number.isNaN(endDate) || startDate >= endDate) {
            public_1.logger400(request.logger, requestBody, undefined, undefined);
            return public_1.code400(response);
        }
        collectionWrite_1.writeOfOpen(collection, startTime, endTime).then((updateResult) => {
            if (updateResult.result.ok) {
            }
            else {
                public_1.logger500(request.logger, requestBody, code_1.SystemErrorCode['错误:数据库回调异常'], updateResult);
                public_1.code500(response);
            }
        })
            .catch((error) => {
            public_1.logger500(request.logger, requestBody, undefined, error);
            public_1.code500(response);
        });
    });
    return router;
};
