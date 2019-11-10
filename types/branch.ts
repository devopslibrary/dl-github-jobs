export interface Branch {
  name: string; // Branch Name
  id: number; // Id within Github
  repoId: number; // Id of Repo this branch belongs to
  lastCommitDate: Date;
  createdAt: Date;
  updatedAt: Date;
  lastSynced: Date;
}
