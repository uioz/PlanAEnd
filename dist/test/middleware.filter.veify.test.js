"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const filter_1 = require("../src/middleware/filter");
const code_1 = require("../src/code");
describe('verifyMiddleware测试', () => {
    describe('功能测试', () => {
        const verify = filter_1.verifyMiddleware('01');
        it('没有用户ID', () => {
            verify({
                session: {
                    userId: undefined
                }
            }, {}, (error) => {
                chai_1.expect(error).eq(code_1.FilterCode['错误:非法请求']);
            });
        });
        it('指定index = 01 测试 1000000', () => {
            verify({
                session: {
                    userId: 1,
                    levelCode: '1000000'
                }
            }, {}, (error) => {
                chai_1.expect(error).eq(code_1.FilterCode['错误:权限不足']);
            });
        });
        it('指定index = 01 测试 1100000', () => {
            verify({
                session: {
                    userId: 1,
                    levelCode: '1100000'
                }
            }, {}, (error) => {
                chai_1.expect(error).eq(undefined);
            });
        });
    });
});
