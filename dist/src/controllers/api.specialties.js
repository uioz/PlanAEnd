"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_1 = require("./public");
/**
 * 本模块使用的集合前缀
 */
exports.CollectionNamePrefix = 'source_';
/**
 * GET请求对应的权限下标
 */
exports.LevelIndexOfGet = '';
exports.addRoute = ({ verifyMiddleware, SessionMiddleware }, globalDataInstance) => {
    const router = express_1.Router();
    router.get('/api/specalties/:year', SessionMiddleware, verifyMiddleware(exports.LevelIndexOfGet), (request, response) => {
        const yearToNumber = parseInt(request.params.year);
        if (!yearToNumber || (yearToNumber !== yearToNumber)) {
            return public_1.code500(response);
        }
        const collection = globalDataInstance.getMongoDatabase().collection(exports.CollectionNamePrefix + yearToNumber), resultSet = new Set();
        collection.find({}, {
            projection: {
                _id: 0,
                speciality: 1
            }
        }).forEach(({ speciality }) => resultSet.add(speciality), () => {
            if (resultSet.size) {
                return public_1.responseAndTypeAuth(response, {
                    stateCode: 200,
                    data: Array.from(resultSet),
                    message: ''
                });
            }
        });
    });
    return router;
};
