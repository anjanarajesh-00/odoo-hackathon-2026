import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { productsHandlers } from "./handlers/products";
import { plansHandlers } from "./handlers/plans";
import { subscriptionsHandlers } from "./handlers/subscriptions";
import { invoicesHandlers } from "./handlers/invoices";
import { paymentsHandlers } from "./handlers/payments";
import { dashboardHandlers } from "./handlers/dashboard";
import { portalHandlers } from "./handlers/portal";

export const worker = setupWorker(
  ...authHandlers,
  ...productsHandlers,
  ...plansHandlers,
  ...subscriptionsHandlers,
  ...invoicesHandlers,
  ...paymentsHandlers,
  ...dashboardHandlers,
  ...portalHandlers
);
