import { http, HttpResponse, delay } from "msw";
import { getStoredProducts, saveStoredProducts } from "../db";
import type { Product, ProductInput } from "@/features/products/schemas";

export const productsHandlers = [
  // GET /products
  http.get("*/products", async ({ request }) => {
    await delay(300); // Artificial delay to test loading skeletons
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10));
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const type = url.searchParams.get("type");
    const sort = url.searchParams.get("sort") || "name:asc";

    let items = [...getStoredProducts()];

    // Search filter
    if (search) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.notes?.toLowerCase().includes(search) ||
          p.variants.some(
            (v) =>
              v.attribute.toLowerCase().includes(search) ||
              v.value.toLowerCase().includes(search)
          )
      );
    }

    // Type filter
    if (type && type !== "all") {
      items = items.filter((p) => p.type === type);
    }

    // Sort
    const [sortField, sortDir] = sort.split(":");
    items.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDir === "desc" ? 1 : -1;
      if (valA > valB) return sortDir === "desc" ? -1 : 1;
      return 0;
    });

    const total = items.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = items.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: paginated,
      total,
      page,
      pageSize,
    });
  }),

  // GET /products/:id
  http.get("*/products/:id", async ({ params }) => {
    await delay(150);
    const items = getStoredProducts();
    const found = items.find((p) => p.id === params.id);
    if (!found) {
      return HttpResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return HttpResponse.json({ data: found });
  }),

  // POST /products
  http.post("*/products", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as ProductInput;

    if (!body.name) {
      return HttpResponse.json(
        { message: "Validation error", errors: { name: "Product name is required" } },
        { status: 422 }
      );
    }

    const items = getStoredProducts();
    const newProduct: Product = {
      ...body,
      id: `prod_${Date.now()}`,
      variants: (body.variants || []).map((v, i) => ({
        ...v,
        id: v.id || `var_${Date.now()}_${i}`,
      })),
    };

    items.unshift(newProduct);
    saveStoredProducts(items);

    return HttpResponse.json({ data: newProduct }, { status: 201 });
  }),

  // PATCH /products/:id
  http.patch("*/products/:id", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as ProductInput;
    const items = getStoredProducts();
    const index = items.findIndex((p) => p.id === params.id);

    if (index === -1) {
      return HttpResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const updated: Product = {
      ...items[index],
      ...body,
      variants: (body.variants || []).map((v, i) => ({
        ...v,
        id: v.id || `var_${Date.now()}_${i}`,
      })),
    };

    items[index] = updated;
    saveStoredProducts(items);

    return HttpResponse.json({ data: updated });
  }),

  // DELETE /products/:id
  http.delete("*/products/:id", async ({ params }) => {
    await delay(200);
    const items = getStoredProducts();
    const filtered = items.filter((p) => p.id !== params.id);
    saveStoredProducts(filtered);
    return HttpResponse.json({ message: "Product deleted" }, { status: 200 });
  }),
];

