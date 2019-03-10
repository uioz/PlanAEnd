var apiCheck = require('api-check')({
  verbose: false
});

const postShape = apiCheck.shape({
  account: apiCheck.string,
  nickname: apiCheck.string.optional,
  level: apiCheck.range(1,63).optional,
  password: apiCheck.string.optional,
  controlarea: apiCheck.arrayOf(apiCheck.string).optional
});

console.log(postShape({
  account: '',
  nickname: '',
  level: 63,
  password: '',
  controlarea: []
}))
