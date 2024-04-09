/*
Paste this into the app.js that Amplify opens for you when creating a new REST endpoint.
*/

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AWS = require('aws-sdk')



// declare a new express app
const app = express()
const router = express.Router()
router.use(bodyParser.json({limit: '10mb'}));
router.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token");
  next();
})

router.post('/classify', async function(req, res) {
  const sagemaker = new AWS.SageMakerRuntime({
    apiVersion: '2017-05-13',
    region:req.body.endpointRegion,
  });

  const result = await sagemaker.invokeEndpoint({
    Body: Buffer.from(req.body.base64Image, 'base64'),
    EndpointName: req.body.endpointName,
    ContentType: 'application/x-image',
    Accept: 'application/json',
  }).promise();

  res.json({predictions: JSON.parse(result.Body.toString())})
})


// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app