import { pagesFunction } from "../../server/_lib/adapter";
import handler from "../../server/admin";

export const onRequest = pagesFunction(handler);
