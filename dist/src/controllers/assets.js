"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_1 = require("./public");
const globalData_1 = require("../globalData");
const utils_1 = require("../model/utils");
/**
 * 简介:
 * 该模块负责静态资源的管理
 * 包含了
 * - 专业消息管理
 * - 静态图片管理
 * - 应用程序名称
 * - 全局公告
 * 顶级URL为/assets
 * 本模块导出的是模块化路由.
 * 该模块下有多个路径
 */
/**
 * 本模块对应的URL地址
 */
exports.URL = '/assets/:type/:key';
/**
 * 本模块使用的集合名称
 */
exports.CollectionName = 'model_assets';
var Type;
(function (Type) {
    Type[Type["image"] = 0] = "image";
    Type[Type["appname"] = 1] = "appname";
    Type[Type["globalnotcie"] = 2] = "globalnotcie";
    Type[Type["speciality"] = 3] = "speciality";
})(Type || (Type = {}));
const getValueFromResult = (data, type, key) => {
    try {
        const result = data[type][key];
        return result !== undefined ? result : false;
    }
    catch (error) {
        return false;
    }
};
exports.MiddlewareOfGet = [
    (request, response, next) => {
        const { type, key } = request.params;
        if (type in Type) {
            const collection = globalData_1.globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
            collection.findOne({}, {
                projection: utils_1.getRemoveIdProjection()
            })
                .then(result => {
                // speciality字段是唯一一个没有二级键的内容,
                // 所以直接进行返回
                if (type === 'speciality') {
                    return public_1.responseAndTypeAuth(response, {
                        stateCode: 200,
                        message: result['speciality']
                    });
                }
                const finalResult = getValueFromResult(result, type, key);
                if (finalResult === false) {
                    public_1.logger400(request.logger, request.params, undefined, undefined);
                    return public_1.code400(response);
                }
                return public_1.responseAndTypeAuth(response, {
                    stateCode: 200,
                    message: finalResult
                });
            })
                .catch(error => {
                public_1.logger500(request.logger, request.params, undefined, error);
                return public_1.code500(response);
            });
        }
        else {
            public_1.logger400(request.logger, request.params, undefined, undefined);
            return public_1.code400(response);
        }
    }
];
