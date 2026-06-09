/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReportData } from '../types';

export const initialReportData: ReportData = {
  header: {
    customerName: "Corteva Malang, Indonesia",
    partnerTicketNum: "619029",
    customerTicketNum: "SCTASK1946080",
    dateOfVisit: "8th June 2026",
    startTime: "8:30 AM",
    endTime: "5:00 PM",
  },
  questionnaire: [
    {
      id: "q1",
      question: "Is the issue resolved?",
      answer: "Yes",
      details: ""
    },
    {
      id: "q2",
      question: "Is revisit required?",
      answer: "No",
      details: ""
    },
    {
      id: "q3",
      question: "Did customer test after providing resolution?",
      answer: "Yes",
      details: ""
    },
    {
      id: "q4",
      question: "Did engineer replace any part?",
      answer: "No",
      details: ""
    },
    {
      id: "q5",
      question: "Is Customer satisfied with the service provided?",
      answer: "Yes",
      details: ""
    }
  ],
  issueDetails: "The Field Service Engineer's, requested to help users migrate their account credential at Corteva Malang on Monday, 8th June 2026 at 8.30 AM – 5.00 PM.",
  resolution: "FSE activities, available on Corteva Malang for supporting the ticket on Monday, 8th June 2026 at 8.30 AM – 5.00 PM.\n\nFSE help customer to migrate their account credential, and the migration is still ongoing.",
  statusUpdates: [
    {
      id: "su1",
      title: "Request Description",
      content: "Need support to help users migrate their account credential at Corteva Malang.",
      bulletPoints: []
    },
    {
      id: "su2",
      title: "Status Update",
      content: "The Field Service Engineer activities, migrate users account credential as instructed by Corteva's IT on Corteva Malang at Jl. Raya Krebet DS Krebet Kec. Bululawang Malang East Java Indonesia 65171 this afternoon on 8th June 2026.",
      bulletPoints: [
        "FSE has done the instruction by Corteva's IT to help users migrate their account"
      ]
    },
    {
      id: "su3",
      title: "Final Update",
      content: "The Field Service Engineer has completed the shift for supporting users on Corteva Malang on 8th June 2026 at 5.00 PM.",
      bulletPoints: [
        "The issues reported in this ticket were resolved successfully. FSE proceed to close the ticket."
      ]
    }
  ],
  engineerName: "M. NIZAR FAHLEVI",
  engineerSignature: "", // Draw canvas
  customerSignName: "DIAN EKO WIDAYANTI",
  customerSignature: "", // Draw canvas
  satisfaction: 5,
  attachments: []
};
