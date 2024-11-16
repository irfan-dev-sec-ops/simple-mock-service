const serverlessExpress = require('@vendia/serverless-express')
const app = require('./server')
app.handler = "function"

exports.handler = serverlessExpress({ app ,
    binarySettings: {
        isBinary: ({ headers }) => true,
        contentTypes: [],
        contentEncodings: []
      }})
