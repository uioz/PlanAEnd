"use strict";
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
            return async function () {
                await collectionCreate_1.createCollection(collectionName, db, {
                    max: 100,
                    insertData: {
                        title: 'hello world'
                    }
                });
                const result = await db.collection(collectionName).stats();
                chai_1.expect(result.max, 'max值相等').eq(100);
                chai_1.expect(result.capped, 'capped为true').eq(true);
                chai_1.expect(result.maxSize, 'maxSize为默认值5242880').eq(5242880);
            }();
        });
        afterEach(() => client.close(true));
    });
});
