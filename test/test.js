var apiCheck = require('api-check')({
  verbose: false
});

const postShape = apiCheck.shape({
  account: apiCheck.string,
  nickname: apiCheck.string,
  level: apiCheck.range(1,63),
  password: apiCheck.string,
  controlarea: apiCheck.arrayOf(apiCheck.string)
});

console.log(postShape({
  account: '',
  nickname: '',
  level: 63,
  password: '',
  controlarea: []
}))
