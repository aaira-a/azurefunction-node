const azureFunctionHandler = require("azure-aws-serverless-express");
const app = require("./app");

// Binds the express app to an Azure Function handler
module.exports = azureFunctionHandler(app);
