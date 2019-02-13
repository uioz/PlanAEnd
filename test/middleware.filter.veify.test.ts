import "mocha";
import { expect } from "chai";
import { verifyMiddleware } from "../src/middleware/filter";
import { ResponseErrorCode } from "../src/code";

describe('verifyMiddleware测试',()=>{

    describe('功能测试',()=>{

        const verify = verifyMiddleware('01');

        it('没有用户ID',()=>{

            verify({
                session: {
                    userId: undefined
                }
            } as any,{} as any,(error)=>{
                expect(error).eq(ResponseErrorCode['错误:非法请求']);
            });

        });

        it('指定index = 01 测试 1000000',()=>{

            verify({
                session:{
                    userId:1,
                    levelCode: '1000000'
                }
            } as any,{} as any,(error)=>{
                expect(error).eq(ResponseErrorCode['错误:权限不足']);
            });

        });

        it('指定index = 01 测试 1100000',()=>{

            verify({
                session: {
                    userId: 1,
                    levelCode: '1100000'
                }
            } as any, {} as any, (error) => {
                expect(error).eq(undefined);
            });

        });

    });

});