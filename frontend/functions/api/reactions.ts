import { pagesFunction } from "../../server/_lib/adapter";
import handler from "../../server/reactions";

export const onRequest = pagesFunction(handler);
