import { pagesFunction } from "../../server/_lib/adapter";
import handler from "../../server/preview";

export const onRequest = pagesFunction(handler);
