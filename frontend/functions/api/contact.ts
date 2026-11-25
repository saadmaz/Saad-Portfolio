import { pagesFunction } from "../../server/_lib/adapter";
import handler from "../../server/contact";

export const onRequest = pagesFunction(handler);
