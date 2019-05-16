/**
 * 不同等级之间的状态码
 * 
 * 有两种使用方式,
 * 1. 将几个值相然后判断大小确认是否有能力
 * 2. 利用Index和Raw判断是否存在对应的位确认是否有能力
 */
export enum LevelCode {
  'SuperUser' = Number(0b0000000),
  'Management' = Number(0b1100000),
  'Download' = Number(0b1010000),
  'Edit' = Number(0b1001000),
  'Upload' = Number(0b1000100),
  'StaticMessage' = Number(0b1000010),
  'View' = Number(0b1000001),
  'superUserIndex' = 0,
  'managementIndex' = 1,
  'downloadIndex' = 2,
  'editIndex' = 3,
  'uploadIndex' = 4,
  'staticMessageIndex' = 5,
  'viewIndex' = 6,
}

export class Privilege {

  static powerList = ['management','download','edit','upload','static','view'];

  /**
   * 将传入的字符串进行格式化为标准的权限位置
   * 要求传入的字符串的长度等于6任何大于6的字符串会被裁剪
   * @param rawCode 权限代码
   */
  static format(rawCode:string){
    if(rawCode.length >= 6){
      return rawCode.split('').reverse().splice(1, 6).reverse().join('');
    }
    throw new Error('length of rawCode must greater than and equal 6.');
  }

  /**
   * 将传入的权限代码,转为一个用于描述权限的对象
   * @param rawCode 权限代码
   */
  static parse(rawCode:string|number){

    if(typeof rawCode  === 'number'){
      rawCode = Privilege.rawCodeIfy(rawCode);
    }

    // 123456789
    // ------>
    // 456789 只保留后6位
    rawCode = Privilege.format(rawCode);

    const result = {
      management:false,
      download:false,
      edit:false,
      upload:false,
      static:false,
      view:false,
    }

    for (const keyName of Privilege.powerList) {
      result[keyName] = !!rawCode[LevelCode[keyName + 'Index']];
    }
    
    return result;

  }

  // TODO 接收对象格式
  static rawCodeIfy(codeNumber:number):string{
    return codeNumber.toString(2);
  }

  static numberIfy(rawCode:string):number{
    return +Privilege.format(rawCode);
  }

}