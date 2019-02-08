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
require("mocha");
const chai_1 = require("chai");
const collectionCreate_1 = require("../src/DAO/collectionCreate");
const mongodb_1 = require("mongodb");
describe('createCollection测试', () => {
    describe('功能测试', () => {
        const databaseName = 'testing', collectionName = 'test';
        let client, db;
        beforeEach((done) => {
            mongodb_1.connect('mongodb://localhost:27017', {
                useNewUrlParser: true
            }, (error, result) => {
                if (error) {
                    return done(error);
                }
                client = result;
                db = client.db(databaseName);
                // 删除旧的数据库
                db.dropCollection(collectionName, (error) => {
                    if (error) {
                        return done(error);
                    }
                    done();
                });
            });
        });
        it('创建数据库', () => {
            return function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield collectionCreate_1.createCollection(collectionName, db, {
                        max: 100,
                        insertData: {
                            title: 'hello world'
                        }
                    });
                    const result = yield db.collection(collectionName).stats();
                    chai_1.expect(result.max, 'max值相等').eq(100);
                    chai_1.expect(result.capped, 'capped为true').eq(true);
                    chai_1.expect(result.maxSize, 'maxSize为默认值5242880').eq(5242880);
                });
            }();
        });
        afterEach(() => client.close(true));
    });
});
