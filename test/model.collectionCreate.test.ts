import "mocha";
import { expect } from "chai";
import { createCollection } from "../src/model/collectionCreate";

import { connect, MongoClient, Db } from "mongodb";

describe('createCollection测试',()=>{

    describe('功能测试',()=>{

        const 
            databaseName = 'testing',
            collectionName = 'test';

        let client:MongoClient,db:Db;


        beforeEach((done)=>{
            connect('mongodb://localhost:27017',{
                useNewUrlParser:true
            },(error,result)=>{

                if(error){
                    return done(error);
                }

                client = result;
                db = client.db(databaseName);

                // 删除旧的数据库
                db.dropCollection(collectionName,(error)=>{
                    if(error){
                        return done(error);
                    }
                    done()
                });

            });
        });

        it('创建数据库',()=>{

            return async function () {

                await createCollection(collectionName, db,{
                    max: 100,
                    insertData: {
                        title: 'hello world'
                    }
                });

                const result = await db.collection(collectionName).stats();

                expect(result.max,'max值相等').eq(100);
                expect(result.capped,'capped为true').eq(true);
                expect(result.maxSize, 'maxSize为默认值5242880').eq(5242880);

            }()

        });

        afterEach(() => client.close(true));

    });

});