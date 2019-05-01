"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const globalData_1 = require("../globalData");
const source_1 = require("./source");
const public_1 = require("./public");
const JSONStream = require("JSONStream");
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
        const year = parseInt(request.params.year), start = parseInt(request.params.start), end = parseInt(request.params.end), isAdmin = request.session.level === 0, isSpecialityAll = request.session.controlArea.length === 0, { speciality } = request.query;
        // 不是管理员且
        // 有专业范围限制
        // 且传入的字段和用户区域不匹配则返回错误
        if (!isAdmin && !isSpecialityAll && speciality && request.session.controlArea.indexOf(speciality) === -1) {
            return public_1.code400(response);
        }
        // 时间全部正确
        if (source_1.checkNumber(year) && source_1.checkNumber(start) && source_1.checkNumber(end)) {
            // 如果提供了查询字段,则使用用户传入的内容进行查询
            // 如果没有则使用所含有的查询范围进行查询
            const query = speciality ? { speciality } : source_1.correctQuery(request.session);
            const open = `
                {
                    stateCode:200,
                    message:'',
                    data:[
                `, spe = `
                ,
                `, close = `
                    ]
                }
                `;
            globalData_1.globalDataInstance.getMongoDatabase().collection(source_1.DatabasePrefixName + year).find(query).sort({
                number: 1,
            }).skip(start).limit(end).stream().pipe(JSONStream.stringify(open, spe, close)).pipe(response.type('json'));
        }
        else {
            return public_1.code400(response);
        }
    }];
