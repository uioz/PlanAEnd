import "mocha";
import { expect } from "chai";
import { LevelCode } from "../src/code";

describe('LeveCode测试',()=>{

    describe('10进制测试',()=>{

        it('SuperUser === 0', () => expect(LevelCode.SuperUser).eq(0));

        it('Management === 140',()=>expect(LevelCode.Management).eq(96));

        it('Download === 120', () => expect(LevelCode.Download).eq(80));

        it('Edit === 110', () => expect(LevelCode.Edit).eq(72));

        it('Upload === 104', () => expect(LevelCode.Upload).eq(68));

        it('StaticMessage === 102', () => expect(LevelCode.StaticMessage).eq(66));

        it('View === 101', () => expect(LevelCode.View).eq(65));

    });

});