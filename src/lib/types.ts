export type Role = "RESEARCHER" | "RESEARCH_ADMIN" | "QA_OFFICER" | "EXECUTIVE";
export type SanghaStatus = "MONK" | "LAITY";
export type AcademicRank = "NONE" | "LECTURER" | "ASST_PROF" | "ASSOC_PROF" | "PROF";
export type PublicationType = "JOURNAL" | "CONFERENCE" | "BOOK" | "CREATIVE_WORK";
export type IndexingTier = "TCI_TIER_1" | "TCI_TIER_2" | "SCOPUS_Q1" | "SCOPUS_Q2" | "SCOPUS_Q3" | "SCOPUS_Q4" | "WOS" | "NATIONAL_CONF" | "INTL_CONF" | "GENERAL";
export type PublicationStatus = "DRAFT" | "SUBMITTED" | "VERIFIED" | "REJECTED";
export type GrantType = "INTERNAL" | "EXTERNAL";
export type GrantStatus = "PROPOSAL" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "TERMINATED";
export type MilestoneStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "OVERDUE";
export type AuthorRole = "FIRST_AUTHOR" | "CORRESPONDING" | "CO_AUTHOR";

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  sanghaStatus: SanghaStatus;
  prefix: string;
  chaya?: string;
  academicRank: string;
  departmentName: string;
}
