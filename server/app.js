const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

require("dotenv").config();
const { verifyJWT } = require("./middleware/middleware.jwtoken");
const loginRoutes = require("./routes/route.login");

const app = express();
const porta = process.env.NODE_API_PORT;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Node UniTreino",
      version: "1.0.0",
      description: "API para acessar banco do UniTreino",
    },
    servers: [
      {
        url: "http://localhost:" + porta,
        description: "Local development server",
      },
    ],
  },
  apis: [
    "./server/routes/route.*.js",
    "./server/routes/*/route.*.js",
    "./server/routes/*/*/route.*.js",
  ],
};

const swaggerDocument = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());
app.use(bodyParser.json());
app.use("/v1/login", loginRoutes);
// app.use("/v1/login", verifyJWT loginRoutes);

app.listen(porta, () => {
  console.log(`Server aberto na porta: ${porta}`);
});
