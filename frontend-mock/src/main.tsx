import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/app/router";
import "@/styles/globals.css";

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCKS === "false") {
    return;
  }
  try {
    const { worker } = await import("@/mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
    console.log("[Brightloop] MSW Mock Service Worker is active.");
  } catch (error) {
    console.warn("[Brightloop] Failed to initialize MSW Service Worker:", error);
  }
}

enableMocking().finally(() => {
  const rootEl = document.getElementById("root");
  if (!rootEl) return;
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </React.StrictMode>
  );
});
