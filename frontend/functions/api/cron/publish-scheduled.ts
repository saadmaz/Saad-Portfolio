import { pagesFunction } from "../../../server/_lib/adapter";
import handler from "../../../server/cron/publish-scheduled";

export const onRequest = pagesFunction(handler);
