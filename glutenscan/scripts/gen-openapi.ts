import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { buildOpenApiDocument } from "../lib/openapi";

const outputPath = join(process.cwd(), "public", "openapi.json");
mkdirSync(join(process.cwd(), "public"), { recursive: true });

const document = buildOpenApiDocument();
writeFileSync(outputPath, JSON.stringify(document, null, 2));

console.log(`OpenAPI schema generated at ${outputPath}`);
