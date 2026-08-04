export const APP_NAME = 'Vocalyze CRM';
export const APP_DESCRIPTION = 'AI-Powered Telecalling & CRM Platform';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  MANAGER: 'manager',
  TEAM_LEADER: 'team_leader',
  EMPLOYEE: 'employee',
} as const;

export const LEAD_STATUSES = [
  'New',
  'Attempted',
  'Contacted',
  'Interested',
  'Qualified',
  'Follow-up',
  'Meeting Fixed',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
  'Duplicate',
  'Spam',
] as const;

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
export const TASK_STATUSES = ['Backlog', 'In Progress', 'Review', 'Done'] as const;

export const DEFAULT_PAGE_SIZE = 20;
