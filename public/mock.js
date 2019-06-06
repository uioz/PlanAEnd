import { mock, setup, Random } from "mockjs";
import pathToRegexp from "path-to-regexp";

// TODO 修复 前端页面请求 model 以及其他的 response 的数据格式为标准格式

setup({
  timeout: '200-600' // see https://github.com/nuysoft/Mock/wiki/Mock.setup()
});

Random.extend({
  ISODateStr() {
    return new Date(Random.datetime()).toJSON();
  }
});

mock('/login', {
  stateCode: 200,
  message: '',
  data: {
    nickName: '@csentence(2,10)',
    level: '@integer(1, 68)',
    levelCodeRaw: '@string("number", 1, 3)',
    'controlArea|1-10': ['@word']
  }
});

mock('/api/server/base', {
  stateCode: 200,
  message: '',
  data: {
    notice: '@cparagraph',
    appname: '@csentence(2,10)',
    brand: '@url',
    logo: '@url',
    bg: '@url',
    pubilc: '/public'
  }
});
// TODO add info about system and school name

mock('/api/state', {
  nickName: '@csentence(2,10)',
  lastLoginTime: '@ISODateStr',
  startTime: '@ISODateStr',
  endTime: '@ISODateStr',
  'runingTime|1000-10000000000': 0,
});

mock('/model', {
  '信息工程系': {
    '计算机应用技术': ['这个技术', '哪个技术'],
    'deepdark': {
      'hello': ['world', 'C++'],
      'deepdark': ['fantasy']
    }
  },
  '新的系': {
    'java': {
      'android': {
        'sqllite': ['3.0', '4.0', '5.0']
      }
    },
    'node': {
      'express': ['egg', 'koa', 'xxx.js']
    }
  },
  "devDependencies": {
    "@vue/cli-plugin-babel": ['7', '8', '9'],
    "@vue/cli-plugin-eslint": ['4', '5', '6'],
    "@vue/cli-service": ['1', '2', '3']
  }
});

mock('/assest/speciality', [
  {
    "name": "信息工程系",
    "title": "你好",
    "notice": "hello",
    "lists": [
      {
        "name": "计算机技术",
        "title": "吗",
        "notice": "",
        "lists": [
          {
            "name": "计算机应用技术",
            "title": "我",
            "notice": "",
            "lists": [

            ]
          },
          {
            "name": "移动应用开发",
            "title": "知道",
            "notice": "",
            "lists": [

            ]
          }
        ]
      },
      {
        "name": "环境艺术设计",
        "title": "你",
        "notice": "",
        "lists": [
          {
            "name": "室内设计",
            "title": "在那里",
            "notice": "",
            "lists": [

            ]
          }
        ]
      },
      {
        "name": "动漫制作",
        "title": "",
        "notice": "",
        "lists": [
          {
            "name": "数字雕刻技术",
            "title": "",
            "notice": "",
            "lists": [

            ]
          }
        ]
      }
    ]
  }
]);

// TODO 改为 query 查询 ?year=2019
mock('/api/specalties/2019', {
  stateCode: 200,
  message: '',
  "data|5-10": ["@word"]
});

mock(pathToRegexp('/source/json/:year/:start/to/:end'), 'get', {
  stateCode: 200,
  message: '',
  "data|20": [
    {
      "name": "你好吗",
      "number": 12435658679,
      "speciality": "计算机类",
      "ss": "hello区域",
      "score": 372.097045053,
      "specialityPath": []
    }
  ]
});

mock('/api/open/force', {
  stateCode: 200,
  message: '',
  data: '@boolean'
})

mock('/api/open/range', {
  stateCode: 200,
  message: '',
  data: {
    startTime: '@natural(1000000000000,1999999999999)',
    endTime: '@natural(1000000000000,1999999999999)'
  }
});

mock('/api/open', {
  stateCode: 200,
  message: '',
  data: '@boolean'
})


mock('/api/assets', 'get', {
  stateCode: 200,
  message: '',
  data: {
    systemName: '@word',
    clientName: '@word',
    systemMessage: '@word',
    clientMessage: '@word',
    systemBackground:'@word',
    clientBackground:'@word',
    logo:'@word'
  }
});

mock('/api/assets', 'post', {
  stateCode: 200,
  message: '数据上传成功'
});

mock(pathToRegexp('/api/assets/app/image/:type'), 'post', {
  stateCode: 200,
  message: '修改成功',
});

mock('/api/assets/static/photos', 'get', {
  stateCode: 200,
  message: '',
  'data|5-10': [
    {
      id: '@guid',
      src: Random.image('200x100', '#4A7BF7', 'Hello'),
      fileName: '@word'
    }
  ]
})

mock('/api/assets/static/photos', 'post', {
  stateCode: 200,
  message: '上传文件成功',
  'data|5-10': [
    {
      id: '@guid',
      src: Random.image('200x100', '#4A7BF7', 'Hello'),
      fileName: '@word'
    }
  ]
});


// It will not pass to this pattern
// when url has query string
// in order to use regexp
mock(/^\/api\/assets\/static\/photos/, 'delete', {
  stateCode: 200,
  message: '删除成功',
});

// findOne
// mock(pathToRegexp('/api/users/:id'),'get',{
//   stateCode:200,
//   message:'',
//   data:{}
// });

// findAll
mock('/api/users', 'get', {
  stateCode: 200,
  message: '',
  'data|1-20': [
    {
      account: '@word',
      nickname: '@word',
      level: '@integer(0,63)',
      'controlarea|0-5': ['@word']
    }
  ]
});

// updateOne by JSON
mock(pathToRegexp('/api/users'), 'post', {
  stateCode: 200,
  message: '修改成功',
});

// deleteOne
mock(pathToRegexp('/api/users/:id'), 'delete', {
  stateCode: 200,
  message: '删除成功',
});
