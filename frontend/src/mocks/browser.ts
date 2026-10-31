import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { productsHandlers } from "./handlers/products";
import { plansHandlers } from "./handlers/plans";

export const worker = setupWorker(
  ...authHandlers,
  ...productsHandlers,
  ...plansHandlers
);
