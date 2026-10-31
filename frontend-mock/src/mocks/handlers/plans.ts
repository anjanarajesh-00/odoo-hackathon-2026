import { http, HttpResponse, delay } from "msw";
import { getStoredPlans, saveStoredPlans } from "../db";
import type { Plan, PlanInput } from "@/features/plans/schemas";

export const plansHandlers = [
  // GET /plans
  http.get("*/plans", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10));
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const state = url.searchParams.get("state");
    const billingPeriod = url.searchParams.get("billingPeriod");
    const sort = url.searchParams.get("sort") || "name:asc";

    let items = [...getStoredPlans()];

    // Search filter
    if (search) {
      items = items.filter((p) => p.name.toLowerCase().includes(search));
    }

    // State filter
    if (state && state !== "all") {
      items = items.filter((p) => p.state === state);
    }

    // Billing period filter
    if (billingPeriod && billingPeriod !== "all") {
      items = items.filter((p) => p.billingPeriod === billingPeriod);
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

  // GET /plans/:id
  http.get("*/plans/:id", async ({ params }) => {
    await delay(150);
    const items = getStoredPlans();
    const found = items.find((p) => p.id === params.id);
    if (!found) {
      return HttpResponse.json({ message: "Plan not found" }, { status: 404 });
    }
    return HttpResponse.json({ data: found });
  }),

  // POST /plans
  http.post("*/plans", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as PlanInput;

    if (!body.name) {
      return HttpResponse.json(
        { message: "Validation error", errors: { name: "Plan name is required" } },
        { status: 422 }
      );
    }

    const items = getStoredPlans();
    const newPlan: Plan = {
      ...body,
      id: `plan_${Date.now()}`,
      state: "open",
    };

    items.unshift(newPlan);
    saveStoredPlans(items);

    return HttpResponse.json({ data: newPlan }, { status: 201 });
  }),

  // PATCH /plans/:id
  http.patch("*/plans/:id", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as PlanInput;
    const items = getStoredPlans();
    const index = items.findIndex((p) => p.id === params.id);

    if (index === -1) {
      return HttpResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    const updated: Plan = {
      ...items[index],
      ...body,
    };

    items[index] = updated;
    saveStoredPlans(items);

    return HttpResponse.json({ data: updated });
  }),

  // POST /plans/:id/pause
  http.post("*/plans/:id/pause", async ({ params }) => {
    await delay(200);
    const items = getStoredPlans();
    const plan = items.find((p) => p.id === params.id);

    if (!plan) return HttpResponse.json({ message: "Plan not found" }, { status: 404 });

    if (!plan.allowPause) {
      return HttpResponse.json(
        { message: "This plan does not permit pausing (allowPause is disabled)." },
        { status: 409 }
      );
    }
    if (plan.state !== "open") {
      return HttpResponse.json(
        { message: `Cannot pause plan in '${plan.state}' state. Must be open.` },
        { status: 409 }
      );
    }

    plan.state = "paused";
    saveStoredPlans(items);
    return HttpResponse.json({ data: plan });
  }),

  // POST /plans/:id/resume
  http.post("*/plans/:id/resume", async ({ params }) => {
    await delay(200);
    const items = getStoredPlans();
    const plan = items.find((p) => p.id === params.id);

    if (!plan) return HttpResponse.json({ message: "Plan not found" }, { status: 404 });

    if (plan.state !== "paused") {
      return HttpResponse.json(
        { message: `Cannot resume plan in '${plan.state}' state. Must be paused.` },
        { status: 409 }
      );
    }

    plan.state = "open";
    saveStoredPlans(items);
    return HttpResponse.json({ data: plan });
  }),

  // POST /plans/:id/close
  http.post("*/plans/:id/close", async ({ params }) => {
    await delay(200);
    const items = getStoredPlans();
    const plan = items.find((p) => p.id === params.id);

    if (!plan) return HttpResponse.json({ message: "Plan not found" }, { status: 404 });

    if (!plan.allowEarlyClose) {
      return HttpResponse.json(
        { message: "This plan does not permit early closure (allowEarlyClose is disabled)." },
        { status: 409 }
      );
    }
    if (plan.state === "closed") {
      return HttpResponse.json(
        { message: "This plan is already closed." },
        { status: 409 }
      );
    }

    plan.state = "closed";
    saveStoredPlans(items);
    return HttpResponse.json({ data: plan });
  }),

  // POST /plans/:id/renew
  http.post("*/plans/:id/renew", async ({ params, request }) => {
    await delay(200);
    const body = (await request.json()) as { availableTo?: string };
    const items = getStoredPlans();
    const plan = items.find((p) => p.id === params.id);

    if (!plan) return HttpResponse.json({ message: "Plan not found" }, { status: 404 });

    if (!plan.allowRenew) {
      return HttpResponse.json(
        { message: "This plan does not permit renewal (allowRenew is disabled)." },
        { status: 409 }
      );
    }

    if (!body.availableTo) {
      return HttpResponse.json(
        { message: "New availableTo date is required for renewal." },
        { status: 422 }
      );
    }

    plan.availableTo = body.availableTo;
    plan.state = "open";
    saveStoredPlans(items);

    return HttpResponse.json({ data: plan });
  }),
];

