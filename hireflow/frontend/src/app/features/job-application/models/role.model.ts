export interface HiringManager {
  name: string;
  role: string;
  initials: string;
}

export interface RoleSection {
  heading: string;
  body: string;
}

export interface Role {
  id: string;
  company: string;
  team: string;
  title: string;
  summary: string;
  salary: string;
  location: string;
  contract: string;
  teamSize: string;
  /** ISO date, e.g. "2026-11-27". */
  closesOn: string;
  /** ISO date, e.g. "2026-12-04". */
  replyBy: string;
  reviewDay: string;
  hiringManager: HiringManager;
  description: { intro: string[]; sections: RoleSection[] };
}
