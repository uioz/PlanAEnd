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
/**
 * 创建集合并且插入操作
 * **注意**:
 * **注意**:在标准规范中指定max的时候还需要指定size,
 * 使用自定义选项只指定max会将size设置为5mib的大小
 * @param name 要被创建的名称的name
 * @param db 数据库对象
 * @param option 自定义选项
 * @param createOptinos 标准的集合选项
 * @returns 集合对象
 */
function createCollection(name, db, option = {}, createOptinos = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const complete = Object.assign({ capped: (option.size || option.max) ? true : false }, option, createOptinos);
        delete complete.insertData;
        delete complete.force;
        // 给符合条件的集合指定默认大小50MIB
        if (complete.max && !complete.size) {
            complete.size = 5242880;
        }
        if (option.force) {
            // 先删除后创建不然会创建失败
            yield db.dropCollection(name);
        }
        const collection = yield db.createCollection(name, complete);
        if (option.insertData) {
            collection.insert(option.insertData).catch((error) => console.warn(error));
        }
        return collection;
    });
}
exports.createCollection = createCollection;
