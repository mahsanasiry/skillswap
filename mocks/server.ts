import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Used by tests (Node). The browser uses ./browser.ts instead. */
export const server = setupServer(...handlers);
