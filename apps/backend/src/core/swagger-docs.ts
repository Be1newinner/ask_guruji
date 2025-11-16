/**
 * @fileoverview This file contains the configuration for generating Swagger/OpenAPI documentation.
 * It uses swagger-jsdoc to create the documentation from JSDoc comments in the route files.
 */
import swaggerJsdoc from "swagger-jsdoc";

/**
 * The options for swagger-jsdoc.
 * @see https://github.com/Surnet/swagger-jsdoc
 */
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

/**
 * The generated OpenAPI specification.
 * This is used by swagger-ui-express to serve the documentation.
 */
export const openapiSpecification = swaggerJsdoc(options);
