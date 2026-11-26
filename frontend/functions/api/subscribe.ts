import { pagesFunction } from "../../server/_lib/adapter";
import handler from "../../server/subscribe";

export const onRequest = pagesFunction(handler);
