import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ask Guruji",
      version: "1.0.0",
    },
    components: {
      schemas: {
        IngestFile: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.routes.ts", "./src/routes/*.routes.js"],
};

export const openapiSpecification = swaggerJsdoc(options);
