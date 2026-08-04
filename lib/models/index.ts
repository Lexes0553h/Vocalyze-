/**
 * Centralized Domain Models & TypeScript Interfaces for Vocalyze CRM
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'manager' | 'team_leader' | 'employee' | 'admin' | 'agent';
  avatar?: string;
  phone?: string;
  tenantId?: string;
  departmentId?: string;
  teamId?: string;
  title?: string;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Employee extends User {
  employeeId: string;
  managerId?: string;
  dailyCallTarget: number;
  monthlyRevenueTarget: number;
  currentCallsToday: number;
  currentRevenueMTD: number;
  conversionRate: number;
  attendanceRate: number;
  clockedIn: boolean;
  clockInTime?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  website: string;
  employees: number;
  revenue: string;
  location: string;
  deals: number;
  dealValue: number;
  status: 'Active' | 'Prospect' | 'Churned';
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  designation?: string;
  city?: string;
  state?: string;
  country?: string;
  status: 'New' | 'Attempted' | 'Contacted' | 'Interested' | 'Qualified' | 'Follow-up' | 'Meeting Fixed' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost' | 'Duplicate' | 'Spam';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  tags: string[];
  agent: string;
  agentId?: string;
  avatar: string;
  value: number;
  budget?: number;
  source: string;
  remarks?: string;
  lastContact: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt?: string;
  notes: string;
}

export interface Call {
  id: string;
  contact: string;
  contactId?: string;
  company: string;
  agent: string;
  agentId?: string;
  direction: 'inbound' | 'outbound' | 'missed';
  duration: string;
  durationSec?: number;
  time: string;
  date: string;
  disposition: string;
  recording: boolean;
  recordingUrl?: string;
  notes: string;
  phone?: string;
  status?: string;
  muted?: boolean;
  speaker?: boolean;
  transferredTo?: string;
  followUp?: boolean;
  followUpDate?: string;
  isFavorite?: boolean;
  contactPhone?: string;
  summary?: string;
}

export interface CallRecording {
  id: string;
  callId: string;
  agentName: string;
  customerName: string;
  phoneNumber: string;
  duration: string;
  recordedAt: string;
  recordingUrl: string;
  fileSizeMb: number;
  transcriptSnippet?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done';
  assignee: string;
  assigneeId?: string;
  dueDate: string;
  leadId?: string;
  tags: string[];
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  customerName: string;
  agentName: string;
  startTime: string;
  endTime: string;
  locationOrUrl: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

export interface Note {
  id: string;
  leadId?: string;
  contactId?: string;
  authorName: string;
  authorId: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  count: number;
  totalValue: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  totalWorkingHours?: string;
  breakTimeMinutes: number;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  lateMinutes?: number;
}

export interface Target {
  id: string;
  employeeId: string;
  employeeName: string;
  period: 'daily' | 'weekly' | 'monthly';
  callCountTarget: number;
  revenueTarget: number;
  achievedCalls: number;
  achievedRevenue: number;
  startDate: string;
  endDate: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'daily_calls' | 'conversion' | 'employee_performance' | 'lead_funnel' | 'revenue';
  generatedAt: string;
  generatedBy: string;
  summary: string;
  downloadUrl?: string;
}

export interface CrmSettings {
  companyName: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  timezone: string;
  currency: string;
  defaultTelephonyProvider: 'twilio' | 'exotel' | 'knowlarity' | 'plivo' | 'simulated';
  autoRecording: boolean;
  aiSummarization: boolean;
}
