"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalData_1 = require("../globalData");
function default_1(databaseList, configDir) {
    const systemConfig = globalData_1.default.getConfig('systemConfig'), collectionNameList = systemConfig.system.mongodbCollectionList;
    for (const collectionName of collectionNameList) {
        // 使用下划线结尾的是按照年份建立的,不考虑这些集合
        if (!/_$/.test(collectionName)) {
        }
    }
    console.log(collectionNameList);
}
exports.default = default_1;
