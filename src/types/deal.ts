export interface Deal {
  id: number;
  title: string;
  amount: number | null;

  pipelineId: number | null;
  pipelineName: string | null;

  stageId: number | null;
  stageName: string | null;

  statusId: number | null;

  ownerId: number | null;
  ownerName: string | null;

  contactId: number | null;
  contactName: string | null;

  createDate: string | null;
  startDate: string | null;
  finishDate: string | null;
  lastUpdateDate: string | null;

  daysInStage: number | null;
}
