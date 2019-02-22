import "mocha";
import { expect } from "chai";
import { limitWrite } from "../src/model/utils";
import { MongoClient,Db,connect } from "mongodb";

describe('limitWrite测试',()=>{

  describe('功能测试',()=>{

    const
      databaseName = 'testing',
      collectionName = 'test';

    let client: MongoClient, db: Db;

    beforeEach((done)=>{
      connect('mongodb://localhost:27017', {
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

    it(`it work's.`,async function () {
      
      let i = 0 , len = 100,data= [];
      while(i<len){
        data.push(i);
        i++;
      }

      await limitWrite(db.collection(collectionName),data,50);

      const result = await db.collection(collectionName).find().toArray();

      return expect(result.length).eq(data.length);

    });

    afterEach(()=>{

      client.close();

    });

  });

});