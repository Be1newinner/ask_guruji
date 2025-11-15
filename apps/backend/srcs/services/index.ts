import { vectorDB } from "../features/vector_db";
import { createDocumentService, DocumentService } from "./document.service";
import { createQueryService, QueryService } from "./query.service";
import { createStatusService, StatusService } from "./status.service";

export interface AppServices {
  documentService: DocumentService;
  queryService: QueryService;
  statusService: StatusService;
}

const statusService = createStatusService();
const documentService = createDocumentService(vectorDB);
const queryService = createQueryService(vectorDB);

export const appServices: AppServices = {
  documentService,
  queryService,
  statusService,
};
