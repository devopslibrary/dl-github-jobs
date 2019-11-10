import { Branch } from "../types/branch";

export interface Repo {
  name: string;
  id: number;
  orgId: number;
  fullName: string;
  createdAt: Date;
  updatedAt: Date; // When did we last check for updates?
  defaultBranch: string; // List of branches
  lastSynced: Date;
}
