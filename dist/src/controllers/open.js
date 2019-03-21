"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const express_1 = require("express");
const public_1 = require("./public");
const apiCheck = require("api-check");
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
        // 调用  Date.parse()
        // 使用Number.isNaN()判断时间是否合法
    });
    return router;
};
