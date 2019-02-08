import { Db,Collection,CollectionCreateOptions } from "mongodb";

/**
 * 该接口简化了创建集合的流程
 */
interface options {
    /**
     * 创建集合后插入的数据
     */
    insertData?:object;
    /**
     * 集合大小上限 单位字节
     */
    size?:number;
    /**
     * 集合存放文档的上限
     */
    max?:number;
    /**
     * 强制创建集合,这样做会先删除同名集合后创建
     * @default false
     */
    force?:boolean;
}

/**
 * 创建集合并且插入操作
 * **注意**:
 * **注意**:在标准规范中指定max的时候还需要指定size,
 * 使用自定义选项只指定max会将size设置为5mib的大小
 * @param name 要被创建的名称的name
 * @param db 数据库对象
 * @param option 自定义选项
 * @param createOptinos 标准的集合选项
 * @returns 集合对象
 */
export async function createCollection(name: string, db: Db,option:options = {},createOptinos:CollectionCreateOptions = {}){

    const complete = {
        capped: (option.size || option.max) ? true : false,
        ...option,
        ...createOptinos
    };

    try {
        delete complete.insertData;
        delete complete.force;
    } catch (error) {
        
    }

    // 给符合条件的集合指定默认大小50MIB
    if(complete.max && !complete.size){
        complete.size = 5242880;
    }

    if(option.force){
        // 先删除后创建不然会创建失败
        await db.dropCollection(name).catch(()=>{
            // 忽略错误处理,如果集合不存在的话会报错
        })
    }

    const collection = await db.createCollection(name,complete);

    if(option.insertData){
        await collection.insertOne(option.insertData);
    }

    return collection;
}
