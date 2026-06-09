/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ShadingType
} from 'docx';
import { ReportData } from '../types';

// Helper to convert base64 image data to ArrayBuffer for docx
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const parts = base64.split(',');
  const base64Data = parts.length > 1 ? parts[1] : parts[0];
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function exportToDocx(data: ReportData): Promise<void> {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 8, color: "7C3AED" }, // Violet-600 color
    bottom: { style: BorderStyle.SINGLE, size: 8, color: "7C3AED" },
    left: { style: BorderStyle.SINGLE, size: 8, color: "7C3AED" },
    right: { style: BorderStyle.SINGLE, size: 8, color: "7C3AED" }
  };

  const headerShading = {
    fill: "F3F4F6", // Gray 100
    type: ShadingType.CLEAR,
    color: "auto"
  };

  const violetShading = {
    fill: "F5F3FF", // Violet 50
    type: ShadingType.CLEAR,
    color: "auto"
  };

  // Convert signatures if they exist
  let engineerSigRun: ImageRun | Paragraph | null = null;
  if (data.engineerSignature) {
    try {
      const buffer = base64ToArrayBuffer(data.engineerSignature);
      engineerSigRun = new ImageRun({
        data: buffer,
        transformation: { width: 120, height: 60 },
        type: "png"
      });
    } catch (e) {
      console.error("Error drawing engineer signature in DOCX", e);
    }
  }

  let customerSigRun: ImageRun | Paragraph | null = null;
  if (data.customerSignature) {
    try {
      const buffer = base64ToArrayBuffer(data.customerSignature);
      customerSigRun = new ImageRun({
        data: buffer,
        transformation: { width: 120, height: 60 },
        type: "png"
      });
    } catch (e) {
      console.error("Error drawing customer signature in DOCX", e);
    }
  }

  // Define docx document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Banner Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: headerShading,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "Post-Visit Template",
                            bold: true,
                            size: 32, // 16pt
                            color: "7C3AED" // Purple
                          })
                        ]
                      })
                    ],
                    columnSpan: 6,
                    margins: { top: 120, bottom: 120, left: 120, right: 120 }
                  })
                ]
              }),
              // Field Labels Row
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Customer Name", bold: true, size: 18 })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Partner Ticket Number", bold: true, size: 18 })] })],
                    width: { size: 15, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Customer Ticket Number", bold: true, size: 18 })] })],
                    width: { size: 20, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Date of Visit", bold: true, size: 18 })] })],
                    width: { size: 16, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Start Time", bold: true, size: 18 })] })],
                    width: { size: 12, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" },
                    children: [new Paragraph({ children: [new TextRun({ text: "End Time", bold: true, size: 18 })] })],
                    width: { size: 12, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              // Field Values Row
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.header.customerName || "-", size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.header.partnerTicketNum || "-", size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.header.customerTicketNum || "-", size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.header.dateOfVisit || "-", size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.header.startTime || "-", size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.header.endTime || "-", size: 18 })] })] })
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { before: 240 } }), // Margin gap

          // Questionnaire Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({
                    shading: violetShading,
                    children: [new Paragraph({ children: [new TextRun({ text: "Questionnaire", bold: true, color: "7C3AED", size: 20 })] })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: violetShading,
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Yes/No/NA", bold: true, color: "7C3AED", size: 20 })] })],
                    width: { size: 15, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: violetShading,
                    children: [new Paragraph({ children: [new TextRun({ text: "If No specify details", bold: true, color: "7C3AED", size: 20 })] })],
                    width: { size: 35, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              // Mapping each questionnaire item
              ...data.questionnaire.map(item => new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item.question, size: 18 })] })]
                  }),
                  new TableCell({
                    shading: { fill: item.answer === 'Yes' ? 'ECFDF5' : item.answer === 'No' ? 'FEF2F2' : 'F9FAFB', type: ShadingType.CLEAR, color: "auto" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.answer, bold: true, size: 18, color: item.answer === 'Yes' ? '059669' : item.answer === 'No' ? 'DC2626' : '4B5563' })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item.details || "-", size: 16 })] })]
                  })
                ]
              }))
            ]
          }),

          new Paragraph({ text: "", spacing: { before: 240 } }),

          // Details section
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Issue Details:", bold: true, size: 20, color: "1E293B" })], spacing: { after: 120 } }),
                      new Paragraph({ children: [new TextRun({ text: data.issueDetails || "No issue details provided.", size: 18 })] })
                    ],
                    margins: { top: 120, bottom: 120, left: 120, right: 120 }
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { before: 180 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Resolution:", bold: true, size: 20, color: "1E293B" })], spacing: { after: 120 } }),
                      new Paragraph({ children: [new TextRun({ text: data.resolution || "No resolution details provided.", size: 18 })] })
                    ],
                    margins: { top: 120, bottom: 120, left: 120, right: 120 }
                  })
                ]
              })
            ]
          }),

          // Page Break for Signatures and Log Updates
          new Paragraph({ text: "", pageBreakBefore: true }),

          // Ticket Status Log
          new Paragraph({
            text: "Ticket Log Updates & Progress Chronology",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 180 }
          }),

          ...data.statusUpdates.flatMap(log => [
            new Paragraph({
              children: [
                new TextRun({ text: log.title + ": ", bold: true, size: 20, color: "7C3AED" }),
                new TextRun({ text: log.content, size: 18 })
              ],
              spacing: { before: 120, after: 60 }
            }),
            ...log.bulletPoints.map(bullet => new Paragraph({
              children: [new TextRun({ text: "•  " + bullet, size: 18 })],
              indent: { left: 360 },
              spacing: { after: 60 }
            }))
          ]),

          new Paragraph({ text: "", spacing: { before: 360 } }),

          // Signatures and Satisfaction table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    shading: headerShading,
                    children: [new Paragraph({ children: [new TextRun({ text: "Engineer Name", bold: true, size: 18 })] })],
                    width: { size: 22, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: headerShading,
                    children: [new Paragraph({ children: [new TextRun({ text: "Engineer Signature", bold: true, size: 18 })] })],
                    width: { size: 22, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: headerShading,
                    children: [new Paragraph({ children: [new TextRun({ text: "Customer Name", bold: true, size: 18 })] })],
                    width: { size: 22, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: headerShading,
                    children: [new Paragraph({ children: [new TextRun({ text: "Customer Signature", bold: true, size: 18 })] })],
                    width: { size: 22, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    shading: headerShading,
                    children: [new Paragraph({ children: [new TextRun({ text: "Overall Customer Satisfaction", bold: true, size: 16 })] })],
                    width: { size: 12, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              // Data Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: data.engineerName || "-", size: 18 })] })]
                  }),
                  new TableCell({
                    children: [
                      engineerSigRun 
                        ? new Paragraph({ children: [engineerSigRun], alignment: AlignmentType.CENTER }) 
                        : new Paragraph({ children: [new TextRun({ text: "Not Signed", size: 14, color: "94A3B8" })], alignment: AlignmentType.CENTER })
                    ]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: data.customerSignName || "-", size: 18 })] })]
                  }),
                  new TableCell({
                    children: [
                      customerSigRun 
                        ? new Paragraph({ children: [customerSigRun], alignment: AlignmentType.CENTER }) 
                        : new Paragraph({ children: [new TextRun({ text: "Not Signed", size: 14, color: "94A3B8" })], alignment: AlignmentType.CENTER })
                    ]
                  }),
                  new TableCell({
                    shading: violetShading,
                    children: [
                      new Paragraph({ 
                        alignment: AlignmentType.CENTER, 
                        children: [
                          new TextRun({ 
                            text: data.satisfaction > 0 ? `${data.satisfaction} / 5` : "-", 
                            bold: true, 
                            size: 24, 
                            color: "7C3AED" 
                          })
                        ] 
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // Appendix Section if there are attachments
          ...(data.attachments.length > 0 ? [
            new Paragraph({ text: "", pageBreakBefore: true }),
            new Paragraph({
              text: "Appendix",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 180 }
            }),
            ...data.attachments.flatMap((att, idx) => {
              const elements: Paragraph[] = [];
              
              // Attachment Title
              elements.push(new Paragraph({
                children: [
                  new TextRun({ text: `${idx + 1}. ${att.name || att.fileName}`, bold: true, size: 20 })
                ],
                spacing: { before: 180, after: 120 }
              }));

              // Image representation
              if (att.fileType.startsWith('image/') && att.fileUrl) {
                try {
                  const imageBuffer = base64ToArrayBuffer(att.fileUrl);
                  elements.push(new Paragraph({
                    children: [
                      new ImageRun({
                        data: imageBuffer,
                        transformation: { width: 340, height: 260 },
                        type: "png"
                      })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 180 }
                  }));
                } catch (e) {
                  console.error("Error drawing appendix image in DOCX", e);
                  elements.push(new Paragraph({
                    children: [new TextRun({ text: `[Image preview could not be rendered: ${att.fileName}]`, size: 16, color: "EF4444" })],
                    spacing: { after: 120 }
                  }));
                }
              } else {
                // Document / File placeholder
                elements.push(new Paragraph({
                  children: [
                    new TextRun({ text: `📎 Attached Document: ${att.fileName} (${(att.fileSize / 1024).toFixed(1)} KB)`, size: 16, color: "4B5563" })
                  ],
                  spacing: { after: 120 }
                }));
              }

              return elements;
            })
          ] : [])
        ]
      }
    ]
  });

  // Pack document to base64 or blob and download
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeCustomerName = (data.header.customerName || 'Report').replace(/[^a-z0-9]/gi, '_');
  link.download = `Post_Visit_Report_${safeCustomerName}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
