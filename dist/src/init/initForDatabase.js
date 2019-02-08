"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const globalData_1 = require("../globalData");
const collectionCreate_1 = require("../DAO/collectionCreate");
function default_1(databaseList, configDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const systemConfig = globalData_1.default.getConfig('systemConfig'), 
        // 配置文件中的所有存在的文档名称的集合
        collectionNameList = systemConfig.system.mongodbCollectionList, 
        // 数据库对象
        database = globalData_1.default.getMongoDatabase();
        // TODO 目前使用固化在代码中的数据库初始化数据
        return yield collectionCreate_1.createCollection('configuration_static', database, {
            force: true,
            insertData: globalData_1.default.getConfig('systemConfig')
        });
        // for (const collectionName of collectionNameList) {
        //     // 使用下划线结尾的是按照年份动态建立的,不考虑这些集合的创建
        //     if (!/_$/.test(collectionName)){
        //     }
        // }
    });
}
exports.default = default_1;
