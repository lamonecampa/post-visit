/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HeaderInfo {
  customerName: string;
  partnerTicketNum: string;
  customerTicketNum: string;
  dateOfVisit: string;
  startTime: string;
  endTime: string;
}

export interface QuestionnaireItem {
  id: string;
  question: string;
  answer: 'Yes' | 'No' | 'NA';
  details: string;
}

export interface StatusUpdateEntry {
  id: string;
  title: string;
  content: string;
  bulletPoints: string[];
}

export interface AppendixAttachment {
  id: string;
  name: string; // User's customized title, e.g., "Migrate User Account Credential"
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string; // Base64 or object URL for preview and export
}

export interface ReportData {
  header: HeaderInfo;
  questionnaire: QuestionnaireItem[];
  issueDetails: string;
  resolution: string;
  statusUpdates: StatusUpdateEntry[];
  engineerName: string;
  engineerSignature: string; // Base64 data URL
  customerSignName: string;
  customerSignature: string; // Base64 data URL
  satisfaction: number; // 1-5
  attachments: AppendixAttachment[];
}
