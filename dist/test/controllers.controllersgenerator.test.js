"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const controllergenerator_1 = require("../src/controllers/controllergenerator");
describe('ControllerGenerator功能测试', () => {
    describe('constructor', () => {
        it('should return a instance', () => chai_1.expect(new controllergenerator_1.ControllerGenerator('/')).instanceOf(controllergenerator_1.ControllerGenerator));
    });
    describe('methods', () => {
        let instance;
        beforeEach(() => {
            instance = new controllergenerator_1.ControllerGenerator('/');
        });
        it('get', () => {
            const path = '/';
            const middware = () => { };
            instance.get(path, middware);
        });
    });
    describe('can iterable', () => {
    });
});
