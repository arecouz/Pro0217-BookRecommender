import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDocument = YAML.load("./swagger.yaml");

export function setupSwagger(app) {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
	console.log("Swagger Docs available at http://localhost:3000/api-docs");
}
