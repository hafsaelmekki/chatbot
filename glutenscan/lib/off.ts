import crypto from "node:crypto";
import { altProductsResponseSchema, altProductsQuerySchema } from "./schema";
import { logger } from "./logger";

const endpoint = process.env.OFF_ENDPOINT ?? "https://world.openfoodfacts.org";
const userAgent = process.env.OFF_USER_AGENT ?? "GlutenScan/0.1";

export const fetchAlternativeProducts = async (params: unknown) => {
  const query = altProductsQuerySchema.parse(params);

  const url = new URL("/api/v3/products", endpoint);
  if (query.barcode) {
    url.searchParams.set("code", query.barcode);
  }
  if (query.search) {
    url.searchParams.set("search_terms", query.search);
  }
  url.searchParams.set("page_size", String(query.limit));
  url.searchParams.set("fields", "id,product_name,brands,image_small_url,url");

  const response = await fetch(url, {
    headers: {
      "user-agent": userAgent,
      accept: "application/json"
    }
  });

  if (!response.ok) {
    logger.warn({ status: response.status }, "OFF API error");
    throw new Error("Open Food Facts indisponible");
  }

  const payload = await response.json();

  const products = (payload.products ?? []).slice(0, query.limit).map((product: any) => ({
    id: String(product.id ?? product._id ?? product.code ?? crypto.randomUUID()),
    name: product.product_name ?? "Produit sans nom",
    brand: product.brands as string | undefined,
    imageUrl: product.image_small_url as string | undefined,
    url: product.url as string | undefined
  }));

  return altProductsResponseSchema.parse({ products });
};
