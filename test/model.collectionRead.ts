import "mocha";
import { expect } from "chai";
import { readOfRange } from "../src/model/collectionRead";
import { MongoClient, Db, connect,Collection } from "mongodb";

describe('readOfRange测试', () => {

  describe('功能测试', () => {

    const
      databaseName = 'testing',
      collectionName = 'readofrange',
      data = [];

    for (let index = 0; index < 100; index++) {
      data.push({
        index
      });
    }

    let client: MongoClient, db: Db, collection: Collection;

    beforeEach((done) => {

      (async function run() {

        client = await connect('mongodb://localhost:27017', { useNewUrlParser: true });
        db = client.db(databaseName);
        collection = db.collection(collectionName);

        await collection.createIndex('index', { unique: true });
        await collection.insertMany(data);

        return;

      })().then(() => done()).catch(done);

    });

    it(`testing with sortkey`, async function () {

      // TODO 等待编写

    });

    afterEach(() => client.close());

  });

});