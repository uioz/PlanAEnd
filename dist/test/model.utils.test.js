"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const utils_1 = require("../src/model/utils");
const mongodb_1 = require("mongodb");
describe('limitWrite测试', () => {
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
                done();
            });
        });
        it(`it work's.`, async function () {
            let i = 0, len = 100, data = [];
            while (i < len) {
                data.push(i);
                i++;
            }
            await utils_1.limitWrite(db.collection(collectionName), data, 50);
            const result = await db.collection(collectionName).find().toArray();
            return chai_1.expect(result.length).eq(data.length);
        });
        afterEach(() => {
            client.close();
        });
    });
});
