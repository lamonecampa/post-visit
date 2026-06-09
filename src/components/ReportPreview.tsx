/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect, useState } from 'react';
import { Star, ZoomIn, ZoomOut, Maximize2, FilePlus, Sparkles } from 'lucide-react';
import { ReportData } from '../types';

interface ReportPreviewProps {
  data: ReportData;
}

export default function ReportPreview({ data }: ReportPreviewProps) {
  const [zoomScale, setZoomScale] = useState<number>(0.8);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-fit zoom based on parent container width
  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const parentWidth = previewContainerRef.current.clientWidth - 48; // padding offset
        const scale = parentWidth / 794;
        setZoomScale(Math.min(Math.max(Number(scale.toFixed(2)), 0.5), 1));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-100 flex-1 overflow-hidden" id="report-view-preview">
      {/* Zoom Control Toolbar Bar */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="text-violet-600 w-4 h-4" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Digital Report Sheet (A4 Preview)</h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setZoomScale(s => Math.max(s - 0.1, 0.4))}
              className="p-1 rounded cursor-pointer hover:bg-white hover:text-slate-900 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center text-[11px] text-slate-700 font-mono">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(s => Math.min(s + 0.1, 1.2))}
              className="p-1 rounded cursor-pointer hover:bg-white hover:text-slate-900 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              if (previewContainerRef.current) {
                const parentWidth = previewContainerRef.current.clientWidth - 48;
                setZoomScale(Number((parentWidth / 794).toFixed(2)));
              }
            }}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-sm cursor-pointer flex items-center gap-1 hover:text-slate-900 transition-all active:scale-95"
            title="Fit to Screen width"
          >
            <Maximize2 className="w-3.5 h-3.5" /> <span className="text-[11px] font-medium">Fit Fit</span>
          </button>
        </div>
      </div>

      {/* Pages Canvas Wrapper */}
      <div 
        ref={previewContainerRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8 scroll-smooth select-none"
      >
        <div 
          className="flex flex-col gap-10 origin-top transition-transform duration-150 ease-out"
          style={{ transform: `scale(${zoomScale})` }}
        >
          
          {/* ==================== PAGE 1: CORE RECORD INFO ==================== */}
          <div 
            id="report-pdf-page-1"
            className="report-pdf-page w-[794px] h-[1123px] bg-white text-slate-850 p-11 font-sans shadow-xl border border-slate-200 relative shrink-0 flex flex-col justify-start select-text overflow-hidden"
          >
            {/* Header Title Grid Table matching screenshot */}
            <div className="w-full border-t border-b border-l border-r border-violet-600 mb-6">
              {/* Box title banner Row */}
              <div className="bg-slate-50 border-b border-violet-600 text-center py-4.5">
                <h1 className="text-xl font-bold text-violet-700 tracking-wide uppercase font-sans">
                  Post-Visit Template
                </h1>
              </div>

              {/* Data Headers Column Grid */}
              <div className="grid grid-cols-6 text-[10px] font-extrabold uppercase border-b border-violet-600 bg-slate-50/70 text-slate-700">
                <div className="px-3 py-2 border-r border-violet-600">Customer Name</div>
                <div className="px-3 py-2 border-r border-violet-600">Partner Ticket</div>
                <div className="px-3 py-2 border-r border-violet-600">Customer Ticket</div>
                <div className="px-3 py-2 border-r border-violet-600">Date of Visit</div>
                <div className="px-2 py-2 border-r border-violet-600">Start Time</div>
                <div className="px-2 py-2">End Time</div>
              </div>

              {/* Data Values Column Row */}
              <div className="grid grid-cols-6 text-xs text-slate-900 leading-tight">
                <div className="px-3 py-3 border-r border-violet-600 font-medium bg-white min-h-[46px] flex items-center">
                  {data.header.customerName || <span className="text-slate-300">-</span>}
                </div>
                <div className="px-3 py-3 border-r border-violet-600 bg-white font-mono flex items-center break-all">
                  {data.header.partnerTicketNum || <span className="text-slate-300">-</span>}
                </div>
                <div className="px-3 py-3 border-r border-violet-600 bg-white font-mono flex items-center break-all">
                  {data.header.customerTicketNum || <span className="text-slate-300">-</span>}
                </div>
                <div className="px-3 py-3 border-r border-violet-600 bg-white flex items-center">
                  {data.header.dateOfVisit || <span className="text-slate-300">-</span>}
                </div>
                <div className="px-2 py-3 border-r border-violet-600 bg-white flex items-center">
                  {data.header.startTime || <span className="text-slate-300">-</span>}
                </div>
                <div className="px-2 py-3 bg-white flex items-center">
                  {data.header.endTime || <span className="text-slate-300">-</span>}
                </div>
              </div>
            </div>

            {/* Questionnaire Table Block */}
            <div className="w-full border-t border-b border-l border-r border-violet-600 mb-6">
              {/* Question list Headers column */}
              <div className="grid grid-cols-12 text-xs font-bold bg-violet-50 text-violet-850 py-2.5 border-b border-violet-600">
                <div className="col-span-6 px-3">Questionnaire</div>
                <div className="col-span-2 text-center border-l border-violet-600 border-r">Yes/No/NA</div>
                <div className="col-span-4 px-3">If No specify details</div>
              </div>

              {/* Question list rows mapping */}
              {data.questionnaire.map((item) => (
                <div key={item.id} className="grid grid-cols-12 text-[11px] border-b last:border-b-0 border-violet-600 min-h-[34px] items-stretch leading-snug">
                  <div className="col-span-6 px-3 py-2 flex items-center text-slate-800 font-medium">
                    {item.question}
                  </div>
                  
                  <div className={`col-span-2 text-center border-l border-r border-violet-600 py-2 font-bold px-1 flex items-center justify-center ${
                    item.answer === 'Yes' ? 'bg-emerald-50 text-emerald-700' :
                    item.answer === 'No' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {item.answer}
                  </div>

                  <div className="col-span-4 px-3 py-2 flex items-center text-slate-600 text-[10.5px]">
                    {item.answer === 'No' ? (item.details || <span className="italic text-slate-300">No reason specified</span>) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Issue Description Box Row */}
            <div className="w-full border border-violet-600 mb-5 rounded-sm p-4 text-xs bg-white">
              <h3 className="font-extrabold uppercase text-[10.5px] tracking-wider text-slate-800 mb-2">
                Issue Details:
              </h3>
              <p className="text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                {data.issueDetails || "No issue description logged yet."}
              </p>
            </div>

            {/* Resolution Box Row */}
            <div className="w-full border border-violet-600 rounded-sm p-4 text-xs bg-white flex-1 min-h-[160px] flex flex-col justify-start">
              <h3 className="font-extrabold uppercase text-[10.5px] tracking-wider text-slate-800 mb-2">
                Resolution:
              </h3>
              <p className="text-slate-700 leading-relaxed font-sans whitespace-pre-wrap flex-1">
                {data.resolution || "No resolution details logged yet. Use the control form to write down technical activities."}
              </p>
            </div>

            {/* Footer markers on page 1 */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 mt-4 border-t border-slate-100 pt-2 shrink-0">
              <span>Post-Visit Report Builder — Page 1</span>
              <span>CONFIDENTIAL</span>
            </div>
          </div>


          {/* ==================== PAGE 2: LOG CHRONOLOGY & SIGN OFF ==================== */}
          <div 
            id="report-pdf-page-2"
            className="report-pdf-page w-[794px] h-[1123px] bg-white text-slate-850 p-11 font-sans shadow-xl border border-slate-200 relative shrink-0 flex flex-col justify-between select-text overflow-hidden"
          >
            <div>
              {/* Document Header block logo */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600">Post-Visit Log Sheet</span>
                <span className="text-xs font-mono text-slate-500">Ticket #: {data.header.customerTicketNum || 'REPORT'}</span>
              </div>

              {/* Status Update Logs chronologies */}
              <div className="space-y-6">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>Ticket Log Updates & Progress Chronology</span>
                  <span className="text-[9px] font-medium font-sans text-slate-400 normal-case bg-slate-50 px-2 py-0.5 rounded border">
                    Reported on Visit date
                  </span>
                </h3>

                {data.statusUpdates.length === 0 ? (
                  <div className="text-center py-8 text-slate-300 italic text-xs border border-dashed rounded bg-slate-50">
                    No timeline log updates added yet. Add logs in the Status Logs section!
                  </div>
                ) : (
                  <div className="space-y-5">
                    {data.statusUpdates.map((log) => (
                      <div key={log.id} className="text-xs space-y-2">
                        <div className="flex items-baseline gap-2 leading-none border-l-2 border-violet-500 pl-2.5">
                          <span className="font-extrabold text-[#111827] text-xs">
                            {log.title}:
                          </span>
                          <span className="text-slate-400 text-[10px] font-sans">
                            {data.header.dateOfVisit}
                          </span>
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed text-[11px] pl-3.5">
                          {log.content}
                        </p>

                        {log.bulletPoints.length > 0 && (
                          <ul className="space-y-1 pl-6">
                            {log.bulletPoints.map((bullet, idx) => (
                              <li key={idx} className="list-disc text-slate-600 text-[10.5px] leading-relaxed">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom segment: Signatures & Satisfaction Block */}
            <div className="space-y-5">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 shrink-0">
                Sign-off Verified Approvals
              </h3>

              <div className="w-full border border-violet-600 text-xs">
                {/* Sign panel header columns */}
                <div className="grid grid-cols-5 text-[10px] font-extrabold uppercase bg-slate-50 text-slate-700 py-2 border-b border-violet-600">
                  <div className="px-3 border-r border-violet-600 flex items-center">Engineer Name</div>
                  <div className="px-3 border-r border-violet-600 flex items-center">Engineer Signature</div>
                  <div className="px-3 border-r border-violet-600 flex items-center">Customer Name</div>
                  <div className="px-3 border-r border-violet-600 flex items-center">Customer Signature</div>
                  <div className="px-2 text-center flex items-center justify-center font-sans tracking-tight text-[8px] leading-tight">
                    Satisfaction (out of 5)
                  </div>
                </div>

                {/* Sign values row */}
                <div className="grid grid-cols-5 text-xs text-slate-900 leading-snug items-stretch select-none">
                  <div className="px-3 py-3 border-r border-violet-600 bg-white font-medium flex items-center min-h-[90px]">
                    {data.engineerName || <span className="text-slate-300 italic">-</span>}
                  </div>
                  
                  <div className="p-1 border-r border-violet-600 bg-white flex items-center justify-center overflow-hidden min-h-[90px]">
                    {data.engineerSignature ? (
                      <img 
                        src={data.engineerSignature} 
                        alt="Engineer Signature" 
                        referrerPolicy="no-referrer"
                        className="max-h-[74px] max-w-full object-contain pointer-events-none"
                      />
                    ) : (
                      <span className="text-[9px] text-slate-300 italic text-center font-mono">
                        [ Dotted Sign-field ]
                      </span>
                    )}
                  </div>

                  <div className="px-3 py-3 border-r border-violet-600 bg-white font-medium flex items-center min-h-[90px]">
                    {data.customerSignName || <span className="text-slate-300 italic">-</span>}
                  </div>

                  <div className="p-1 border-r border-violet-600 bg-white flex items-center justify-center overflow-hidden min-h-[90px]">
                    {data.customerSignature ? (
                      <img 
                        src={data.customerSignature} 
                        alt="Customer Signature" 
                        referrerPolicy="no-referrer"
                        className="max-h-[74px] max-w-full object-contain pointer-events-none"
                      />
                    ) : (
                      <span className="text-[9px] text-slate-300 italic text-center font-mono">
                        [ Dotted Sign-field ]
                      </span>
                    )}
                  </div>

                  <div className="bg-violet-50 flex flex-col items-center justify-center gap-1.5 p-1 min-h-[90px]">
                    <span className="text-2xl font-black text-violet-700 font-mono leading-none">
                      {data.satisfaction || "-"}
                    </span>
                    <div className="flex gap-0.5 scale-75 opacity-80 shrink-0">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <Star
                          key={val}
                          className={`w-3.5 h-3.5 ${
                            val <= data.satisfaction ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer row metadata */}
              <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-2 shrink-0">
                <span>Post-Visit Report Builder — Page 2</span>
                <span>CONFIDENTIAL</span>
              </div>
            </div>
          </div>


          {/* ==================== PAGES 3+: APPENDIX ATTACHMENTS ==================== */}
          {data.attachments.map((att, idx) => (
            <div 
              key={att.id}
              className="report-pdf-page w-[794px] h-[1123px] bg-white text-slate-850 p-11 font-sans shadow-xl border border-slate-200 relative shrink-0 flex flex-col justify-between select-text overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600">Post-Visit Appendix Page</span>
                  <span className="text-xs font-mono text-slate-500">Attachment {idx + 1} of {data.attachments.length}</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                    <span className="text-xl font-black text-violet-600">{idx + 1}.</span> 
                    <span>{att.name || att.fileName}</span>
                  </h1>

                  {/* Attachment body rendering */}
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center min-h-[440px] shadow-sm max-h-[800px] overflow-hidden group">
                    {att.fileType.startsWith('image/') ? (
                      <img 
                        src={att.fileUrl} 
                        alt={att.name} 
                        referrerPolicy="no-referrer"
                        className="max-h-[600px] max-w-full rounded border border-white shadow object-contain"
                      />
                    ) : att.fileType.startsWith('video/') ? (
                      <div className="text-center p-8 space-y-3">
                        <div className="w-20 h-20 bg-violet-100 hover:scale-105 transition-transform rounded-full flex items-center justify-center text-violet-600 text-3xl mx-auto shadow border border-violet-200">
                          🎬
                        </div>
                        <span className="text-sm font-bold block text-slate-800">{att.fileName}</span>
                        <span className="text-xs text-slate-400 block uppercase font-mono bg-white px-2.5 py-1 rounded inline-block border">
                          Embedded Reference video
                        </span>
                        <span className="text-xs text-slate-500 max-w-md block leading-relaxed">
                          This media file has been packaged securely. The player and raw stream links are exported cleanly inside your download attachments folder.
                        </span>
                      </div>
                    ) : (
                      // Document type
                      <div className="text-center p-8 space-y-3">
                        <div className="text-5xl">📄</div>
                        <span className="text-sm font-bold block text-slate-850">{att.fileName}</span>
                        <span className="text-xs text-slate-400 uppercase font-mono bg-white px-2 py-0.5 rounded border">
                          Reference Document file
                        </span>
                        <span className="text-xs text-slate-5s0 max-w-sm block leading-relaxed">
                          Document Type: {att.fileType || "application/octet-stream"} <br />
                          Size: {(att.fileSize / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Appendix Footer metadata */}
              <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-2">
                <span>Post-Visit Report Builder — Appendix Page {idx + 3}</span>
                <span>CONFIDENTIAL</span>
              </div>
            </div>
          ))}

          {/* Fallback empty sheet if no images, to show how we label references */}
          {data.attachments.length === 0 && (
            <div className="report-pdf-page w-[794px] h-[1123px] bg-white text-slate-800 p-11 font-sans shadow-xl border border-slate-200 relative shrink-0 flex flex-col justify-between text-center select-none overflow-hidden">
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6 select-text text-left">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600">Post-Visit Appendix Page</span>
                  <span className="text-xs text-slate-400 italic">No attachments added</span>
                </div>

                <div className="py-24 max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-dashed border-slate-300 pointer-events-none mx-auto text-xl">
                    📎
                  </div>
                  <h3 className="font-extrabold text-slate-700 text-sm">Appendix Attachment Area</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                    Attach photos, screenshot proofs (e.g., "Migrate User Account Credential") in the control form. They will populate clean A4 appendix log pages right here!
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-2 select-text text-left shrink-0">
                <span>Post-Visit Report Builder — Appendix</span>
                <span>CONFIDENTIAL</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
