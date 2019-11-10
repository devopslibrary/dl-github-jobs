export interface Branch {
  name: string; // Branch Name
  repoId: number; // Id of Repo this branch belongs to
  lastCommitDate: Date;
  lastSynced: Date;
}
