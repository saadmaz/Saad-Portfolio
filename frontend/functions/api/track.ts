import { pagesFunction } from "../../server/_lib/adapter";
import handler from "../../server/track";

export const onRequest = pagesFunction(handler);
