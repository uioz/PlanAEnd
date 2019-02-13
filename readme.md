# 目录结构

```
+--PlanAEnd
 +-- config 存放配置文件
 +-- dist 构建完成后的目录
 +-- log 存放日志的文件夹
 +-- public 存放Static中公用的页面以及静态图片的位置
 +-- src 源文件目录
 +-- static 静态页面目录(客户端和后端的静态文件)
  +-- end 后端静态文件
  +-- front 前端静态文件(包括测试文件)
 +-- test 单元测试目录
```

# 登录处理

- 查询对应用户
- 将用户id挂载到session上
- 将用户levelCodeRaw挂载到session上