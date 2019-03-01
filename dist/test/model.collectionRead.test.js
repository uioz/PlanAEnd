"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const collectionRead_1 = require("../src/model/collectionRead");
const mongodb_1 = require("mongodb");
describe('readOfRange测试', () => {
    describe('功能测试', () => {
        const databaseName = 'testing', collectionName = 'readofrange', data = [];
        for (let index = 0; index < 100; index++) {
            data.push({
                index
            });
        }
        let client, db, collection;
        beforeEach((done) => {
            (async function run() {
                client = await mongodb_1.connect('mongodb://localhost:27017', { useNewUrlParser: true });
                db = client.db(databaseName);
                collection = db.collection(collectionName);
                await collection.createIndex('index', { unique: true });
                await collection.insertMany(data);
                return;
            })().then(() => done()).catch(done);
        });
        it(`testing with sortkey`, async function () {
            const result = await collectionRead_1.readOfRange(collection, 20, 80);
            return chai_1.expect(result.length).eq(60);
        });
        afterEach(() => client.close());
    });
});
