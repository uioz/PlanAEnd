"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const code_1 = require("../src/code");
describe('LeveCode测试', () => {
    describe('10进制测试', () => {
        it('SuperUser === 0', () => chai_1.expect(code_1.LevelCode.SuperUser).eq(0));
        it('Management === 140', () => chai_1.expect(code_1.LevelCode.Management).eq(96));
        it('Download === 120', () => chai_1.expect(code_1.LevelCode.Download).eq(80));
        it('Edit === 110', () => chai_1.expect(code_1.LevelCode.Edit).eq(72));
        it('Upload === 104', () => chai_1.expect(code_1.LevelCode.Upload).eq(68));
        it('StaticMessage === 102', () => chai_1.expect(code_1.LevelCode.StaticMessage).eq(66));
        it('View === 101', () => chai_1.expect(code_1.LevelCode.View).eq(65));
    });
});
