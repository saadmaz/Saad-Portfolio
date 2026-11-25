import { pagesFunction } from "../../server/_lib/adapter";
import handler from "../../server/feed";

export const onRequest = pagesFunction(handler);
