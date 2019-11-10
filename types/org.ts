export interface Org {
  name: string; // Organization Name
  id: number; // Id within Github
  installationId: number; // Specific Installation of App, used for tokens
  createdAt: Date; // When was the Org created?
  updatedAt: Date; // When did we last check for updates?
  lastSynced: Date;
}
