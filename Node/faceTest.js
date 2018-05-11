const rp = require('request-promise')

async function test () {
  let result = await rp.get('http://118.24.120.229:3000/ADD7A65F-4EB6-4DAA-B543-B71EC7D95A59', {
    headers: {
      referer: 'DEFE2946-9C0C-40E5-8908-7151ED2AEE28'
    }
  })
  console.log(result)
}
test()
// var request = require("request");

// var options = {
//   method: 'GET',
//   url: 'http://118.24.120.229:3000/ADD7A65F-4EB6-4DAA-B543-B71EC7D95A59',
//   headers: {
//     'postman-token': 'f733f2e6-f091-3508-36cb-e21b0de92bf4',
//     'cache-control': 'no-cache',
//     'referer': 'DEFE2946-9C0C-40E5-8908-7151ED2AEE28'
//   },

// };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);
//   console.log(body);
// });
