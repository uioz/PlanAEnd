import "mocha";
import { expect } from "chai";
import { ControllerGenerator } from "../src/controllers/controllergenerator";

describe('ControllerGenerator功能测试', () => {


  describe('constructor', () => {
    it('should return a instance', () => expect(new ControllerGenerator('/')).instanceOf(ControllerGenerator));
  });

  describe('methods',()=>{

    let instance:ControllerGenerator;

    beforeEach(()=>{
      instance = new ControllerGenerator('/');
    });

    it('get',()=>{

      const path = '/';
      const middware = ()=>{};

      instance.get(path,middware);

    })

  });

  describe('can iterable',()=>{

    

  });



})