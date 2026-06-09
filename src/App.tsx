/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  Sparkles, 
  Check, 
  Bookmark, 
  Loader2, 
  RefreshCw,
  FileDown
} from 'lucide-react';
import { ReportData } from './types';
import { initialReportData } from './utils/sampleData';
import { exportToDocx } from './utils/docxExport';
import { exportToPdf } from './utils/pdfExport';
import ReportForm from './components/ReportForm';
import ReportPreview from './components/ReportPreview';

export default function App() {
  const [reportData, setReportData] = useState<ReportData>(initialReportData);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState("");
  const [pdfProgressPercent, setPdfProgressPercent] = useState(0);

  // Clear Report Values
  const handleClear = () => {
    const cleared: ReportData = {
      header: {
        customerName: "",
        partnerTicketNum: "",
        customerTicketNum: "",
        dateOfVisit: "",
        startTime: "",
        endTime: "",
      },
      questionnaire: reportData.questionnaire.map(q => ({ ...q, answer: 'Yes', details: "" })),
      issueDetails: "",
      resolution: "",
      statusUpdates: [],
      engineerName: "",
      engineerSignature: "",
      customerSignName: "",
      customerSignature: "",
      satisfaction: 0,
      attachments: []
    };
    setReportData(cleared);
  };

  // Restores standard initial sample template value
  const handleLoadExample = () => {
    setReportData(initialReportData);
  };

  // Triggers Word document download (.docx)
  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      await exportToDocx(reportData);
    } catch (e) {
      console.error("Failed to compile docx Word template", e);
      alert("Word export failed. Please check content fields match structure.");
    } finally {
      setIsExportingWord(false);
    }
  };

  // Triggers browser PDF print and compiles custom canvas PDF
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setPdfProgressText("Initializing PDF Page Capture...");
    setPdfProgressPercent(5);

    try {
      // Query physical of pages rendered in DOM viewport preview
      const pages = Array.from(document.querySelectorAll('.report-pdf-page')) as HTMLElement[];
      await exportToPdf(pages, reportData.header.customerName, (step, percent) => {
        setPdfProgressText(step);
        setPdfProgressPercent(percent);
      });
    } catch (e) {
      console.error("Failed to compile pdf canvas", e);
      alert("PDF render synthesis failed. Check image sizes or browser rules.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0F0F10] font-sans text-gray-200 overflow-hidden relative">
      
      {/* Top Main Navigation Menu Bar */}
      <header className="h-[72px] bg-[#161618] border-b border-white/10 flex items-center justify-between px-8 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 text-blue-500 rounded-lg p-2 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">
              Post-Visit Report Generator
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Standardized reporting tool for on-site engineering visits
            </p>
          </div>
        </div>

        {/* Action downloads buttons */}
        <div className="flex items-center gap-3">
          {/* MS Word Downloader button */}
          <button
            onClick={handleExportWord}
            disabled={isExportingWord || isExportingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-gray-200 hover:text-white transition-colors text-xs font-medium cursor-pointer disabled:opacity-50 select-none active:scale-95"
            title="Download formatted Microsoft Word document (.docx)"
          >
            {isExportingWord ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
            )}
            Export Word
          </button>

          {/* High Fidelity PDF compiler button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingWord || isExportingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-xs font-medium shadow-lg shadow-blue-900/20 cursor-pointer disabled:opacity-50 select-none active:scale-95 border border-white/5"
            title="Siphon DOM nodes and print vector high-resolution PDF document"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Export PDF
          </button>
        </div>
      </header>

      {/* Main Work Area Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: interactive setup form */}
        <div className="w-[390px] md:w-[430px] shrink-0 h-full border-r border-white/10">
          <ReportForm
            data={reportData}
            onChange={setReportData}
            onClear={handleClear}
            onLoadExample={handleLoadExample}
          />
        </div>

        {/* Right Side: high fidelity scrolling canvas sheet preview */}
        <div className="flex-1 h-full">
          <ReportPreview data={reportData} />
        </div>
      </main>

      {/* PDF Generation Loader overlay modal */}
      {isExportingPdf && (
        <div className="absolute inset-0 z-50 bg-[#0F0F10]/90 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#161618] border border-white/15 rounded-xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin absolute" />
              <FileText className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Synthesizing PDF Pages</h3>
              <p className="text-xs text-gray-400 font-mono tracking-tight leading-relaxed max-w-xs mx-auto">
                {pdfProgressText}
              </p>
            </div>

            {/* Micro progress indicator */}
            <div className="space-y-1">
              <div className="w-full bg-[#0F0F10] rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${pdfProgressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-bold font-mono text-center block">
                {pdfProgressPercent}% Complete
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Word export indicator modal spinner */}
      {isExportingWord && (
        <div className="absolute inset-0 z-50 bg-[#0F0F10]/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#161618] border border-white/15 rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 select-none">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono">
              Formatting Word Artifacts...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
