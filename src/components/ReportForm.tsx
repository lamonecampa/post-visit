/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Ticket, 
  Calendar, 
  Clock, 
  CheckSquare, 
  AlertCircle, 
  FileText, 
  Plus, 
  Trash2, 
  X, 
  Star, 
  Upload, 
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { ReportData, QuestionnaireItem, StatusUpdateEntry, AppendixAttachment } from '../types';
import SignatureCanvas from './SignatureCanvas';

interface ReportFormProps {
  data: ReportData;
  onChange: (newData: ReportData) => void;
  onClear: () => void;
  onLoadExample: () => void;
}

export default function ReportForm({ data, onChange, onClear, onLoadExample }: ReportFormProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'questions' | 'details' | 'logs' | 'signatures' | 'appendix'>('general');
  const [newLogBullet, setNewLogBullet] = useState<{ [key: string]: string }>({});

  const handleHeaderChange = (field: keyof typeof data.header, value: string) => {
    onChange({
      ...data,
      header: {
        ...data.header,
        [field]: value
      }
    });
  };

  const handleQuestionChange = (id: string, field: 'answer' | 'details', value: string) => {
    const updatedQuestionnaire = data.questionnaire.map(q => {
      if (q.id === id) {
        return { ...q, [field]: value };
      }
      return q;
    });
    onChange({
      ...data,
      questionnaire: updatedQuestionnaire
    });
  };

  const handleTextChange = (field: 'issueDetails' | 'resolution' | 'engineerName' | 'customerSignName' | 'satisfaction' | 'engineerSignature' | 'customerSignature', value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Status Log functions
  const handleAddLog = () => {
    const newLog: StatusUpdateEntry = {
      id: "log_" + Date.now(),
      title: "New Status Update",
      content: "Enter description here...",
      bulletPoints: []
    };
    onChange({
      ...data,
      statusUpdates: [...data.statusUpdates, newLog]
    });
  };

  const handleDeleteLog = (id: string) => {
    const filtered = data.statusUpdates.filter(l => l.id !== id);
    onChange({
      ...data,
      statusUpdates: filtered
    });
  };

  const handleLogChange = (id: string, field: 'title' | 'content', value: string) => {
    const updated = data.statusUpdates.map(l => {
      if (l.id === id) {
        return { ...l, [field]: value };
      }
      return l;
    });
    onChange({
      ...data,
      statusUpdates: updated
    });
  };

  const handleAddLogBullet = (id: string) => {
    const bulletText = newLogBullet[id]?.trim();
    if (!bulletText) return;

    const updated = data.statusUpdates.map(l => {
      if (l.id === id) {
        return { ...l, bulletPoints: [...l.bulletPoints, bulletText] };
      }
      return l;
    });

    onChange({
      ...data,
      statusUpdates: updated
    });

    setNewLogBullet({
      ...newLogBullet,
      [id]: ''
    });
  };

  const handleDeleteLogBullet = (logId: string, bulletIdx: number) => {
    const updated = data.statusUpdates.map(l => {
      if (l.id === logId) {
        const temp = [...l.bulletPoints];
        temp.splice(bulletIdx, 1);
        return { ...l, bulletPoints: temp };
      }
      return l;
    });
    onChange({
      ...data,
      statusUpdates: updated
    });
  };

  // Upload Appendix attachments
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const newAttachment: AppendixAttachment = {
          id: "att_" + Date.now() + Math.random().toString(36).substr(2, 5),
          name: file.name.split('.')[0].replace(/[_-]/g, ' '), // Clean display name
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: base64String
        };

        onChange({
          ...data,
          attachments: [...data.attachments, newAttachment]
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset standard input element
    e.target.value = '';
  };

  const handleDeleteAttachment = (id: string) => {
    const filtered = data.attachments.filter(att => att.id !== id);
    onChange({
      ...data,
      attachments: filtered
    });
  };

  const handleAttachmentNameChange = (id: string, newName: string) => {
    const updated = data.attachments.map(att => {
      if (att.id === id) {
        return { ...att, name: newName };
      }
      return att;
    });
    onChange({
      ...data,
      attachments: updated
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#161618] text-gray-200 border-r border-[#1e1e21] shadow-2xl overflow-hidden">
      {/* Form Toolbar Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0F0F10]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="font-bold text-xs tracking-wider text-white uppercase">Report Field Builder</h2>
        </div>
        <div className="flex gap-1.5 text-xs">
          <button
            onClick={onLoadExample}
            disabled={true ? false : false}
            className="px-2.5 py-1.5 rounded-md border border-white/10 hover:bg-white/10 font-medium text-gray-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            title="Load default sample template values"
          >
            <Layers className="w-3.5 h-3.5" /> Sample Info
          </button>
          <button
            onClick={onClear}
            className="px-2.5 py-1.5 rounded-md border border-red-900/40 hover:bg-red-900/20 font-medium text-red-400 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            title="Clear all fields"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Accordion Tabs Selection */}
      <div className="flex border-b border-white/10 bg-[#0F0F10] text-xs overflow-x-auto scrollbar-none sticky top-0 z-10 p-1 gap-1">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-none px-3.5 py-2.5 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'general' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Client Header
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-none px-3.5 py-2.5 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Questionnaire
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-none px-3.5 py-2.5 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'details' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" /> Issue & Fix
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-none px-3.5 py-2.5 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Status Logs
        </button>
        <button
          onClick={() => setActiveTab('signatures')}
          className={`flex-none px-3.5 py-2.5 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'signatures' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Signatures
        </button>
        <button
          onClick={() => setActiveTab('appendix')}
          className={`flex-none px-3.5 py-2.5 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'appendix' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Appendix
        </button>
      </div>

      {/* Form Contents Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        
        {/* TAB 1: GENERAL/CLIENT HEADER INFO */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5 text-xs text-slate-400">
              <span className="font-semibold text-blue-400 block mb-1">💡 Instructions</span>
              Fill in the client identity, tickets and precise time slots of the visited site below.
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-customerName" className="text-[10px] uppercase font-semibold text-gray-500">Customer Name</label>
              <input
                id="input-customerName"
                type="text"
                value={data.header.customerName}
                onChange={(e) => handleHeaderChange('customerName', e.target.value)}
                placeholder="e.g., Quantum Dynamics Systems Ltd."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="input-partnerTicketNum" className="text-[10px] uppercase font-semibold text-gray-500">Partner Ticket ID</label>
                <input
                  id="input-partnerTicketNum"
                  type="text"
                  value={data.header.partnerTicketNum}
                  onChange={(e) => handleHeaderChange('partnerTicketNum', e.target.value)}
                  placeholder="e.g., PT-9982-A"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all outline-none text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="input-customerTicketNum" className="text-[10px] uppercase font-semibold text-gray-500">Customer Ticket ID</label>
                <input
                  id="input-customerTicketNum"
                  type="text"
                  value={data.header.customerTicketNum}
                  onChange={(e) => handleHeaderChange('customerTicketNum', e.target.value)}
                  placeholder="e.g., INC-2023-004"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-dateOfVisit" className="text-[10px] uppercase font-semibold text-gray-500">Date of Visit</label>
              <input
                id="input-dateOfVisit"
                type="text"
                value={data.header.dateOfVisit}
                onChange={(e) => handleHeaderChange('dateOfVisit', e.target.value)}
                placeholder="e.g., 2023-10-24"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="input-startTime" className="text-[10px] uppercase font-semibold text-gray-500">Start Time</label>
                <input
                  id="input-startTime"
                  type="text"
                  value={data.header.startTime}
                  onChange={(e) => handleHeaderChange('startTime', e.target.value)}
                  placeholder="e.g., 09:00"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all outline-none text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="input-endTime" className="text-[10px] uppercase font-semibold text-gray-500">End Time</label>
                <input
                  id="input-endTime"
                  type="text"
                  value={data.header.endTime}
                  onChange={(e) => handleHeaderChange('endTime', e.target.value)}
                  placeholder="e.g., 14:45"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUESTIONNAIRE ITEMS */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5 text-xs text-gray-400">
              <span className="font-semibold text-blue-400 block mb-1">📋 Checkboxes & Options</span>
              Confirm item status with Yes/No/NA. If set to <strong>No</strong>, specify the reasons or explanations in the details field.
            </div>

            {data.questionnaire.map((item) => (
              <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                <span className="text-gray-200 font-medium block text-xs">{item.question}</span>
                
                <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10 text-xs font-medium">
                  {(['Yes', 'No', 'NA'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleQuestionChange(item.id, 'answer', opt)}
                      className={`flex-1 py-1.5 px-3 rounded text-center cursor-pointer transition-all ${
                        item.answer === opt 
                          ? opt === 'Yes' ? 'bg-blue-600 text-white font-bold'
                            : opt === 'No' ? 'bg-red-900/50 text-red-200 font-bold'
                            : 'bg-white/10 text-white font-bold'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {item.answer === 'No' && (
                  <div className="pt-1 select-none animate-slide-down">
                    <input
                      type="text"
                      value={item.details}
                      onChange={(e) => handleQuestionChange(item.id, 'details', e.target.value)}
                      placeholder="Specify details for client No..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DETAILS & RESOLUTION */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="textarea-issueDetails" className="text-[10px] uppercase font-semibold text-gray-500">Issue Details</label>
              <textarea
                id="textarea-issueDetails"
                value={data.issueDetails}
                onChange={(e) => handleTextChange('issueDetails', e.target.value)}
                placeholder="Write description of the client's problem..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all text-sm outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="textarea-resolution" className="text-[10px] uppercase font-semibold text-gray-500">Resolution Details</label>
              <textarea
                id="textarea-resolution"
                value={data.resolution}
                onChange={(e) => handleTextChange('resolution', e.target.value)}
                placeholder="Describe resolutions or activities completed by the FSE engineer..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all text-sm outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 4: PROGRESS LOGS / UPDATES CHRONOLOGY */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5 text-xs text-gray-400">
              <span className="font-semibold text-blue-400 block mb-1">🕒 Log Entries (Page 2)</span>
              Record individual ticket actions (e.g. Request Details, status, next actions). You can draft titles and detailed list bullet items.
            </div>

            <div className="space-y-3">
              {data.statusUpdates.map((log) => (
                <div key={log.id} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3 relative group">
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="absolute top-3 right-3 p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete entry"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="pr-6 space-y-2">
                    <input
                      type="text"
                      value={log.title}
                      onChange={(e) => handleLogChange(log.id, 'title', e.target.value)}
                      placeholder="e.g. Request Description"
                      className="bg-transparent font-bold text-white w-full border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none pb-0.5 text-xs transition-all outline-none"
                    />
                    
                    <textarea
                      value={log.content}
                      onChange={(e) => handleLogChange(log.id, 'content', e.target.value)}
                      placeholder="Details of this status update..."
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-blue-500 transition-all outline-none"
                    />
                  </div>

                  {/* Bullet points area */}
                  <div className="border-t border-white/5 pt-2.5">
                    <span className="text-[11px] uppercase font-bold text-gray-500 block mb-1.5">Logged Bullets</span>
                    
                    {log.bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 mb-2">
                        {log.bulletPoints.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-1 text-gray-300 text-xs pl-1">
                            <span className="text-blue-500 mt-1 flex-none">•</span>
                            <span className="flex-1">{bullet}</span>
                            <button
                              onClick={() => handleDeleteLogBullet(log.id, idx)}
                              className="text-gray-500 hover:text-red-400 p-0.5 rounded hover:bg-white/5 transition-colors ml-1 cursor-pointer"
                              title="Delete bullets"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newLogBullet[log.id] || ''}
                        onChange={(e) => setNewLogBullet({ ...newLogBullet, [log.id]: e.target.value })}
                        placeholder="Add new bullet point..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLogBullet(log.id);
                          }
                        }}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-[11px] text-gray-300 focus:outline-none focus:border-blue-500 transition-all outline-none"
                      />
                      <button
                        onClick={() => handleAddLogBullet(log.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddLog}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-dashed border-white/10 hover:border-white/20 text-xs font-semibold rounded-lg text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-blue-400" /> New Log Entry
            </button>
          </div>
        )}

        {/* TAB 5: SIGNATURES & REVIEWS */}
        {activeTab === 'signatures' && (
          <div className="space-y-4">
            <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5 text-xs text-gray-400">
              <span className="font-semibold text-blue-400 block mb-1">✍️ Digital Signature Capture</span>
              Let engineers and customers sign digitally directly on screen using their mouse or touch devices.
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb]">Engineer Details</h3>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="input-engineerName" className="text-xs font-semibold text-gray-300">Engineer Name</label>
                <input
                  id="input-engineerName"
                  type="text"
                  value={data.engineerName}
                  onChange={(e) => handleTextChange('engineerName', e.target.value)}
                  placeholder="e.g. M. NIZAR FAHLEVI"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-300">Engineer Signature Drawing</span>
                <SignatureCanvas
                  id="engineer-sig-pad"
                  value={data.engineerSignature}
                  onChange={(base64) => handleTextChange('engineerSignature', base64)}
                  placeholderText="Sign here (Field Engineer)..."
                />
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2563eb]">Customer Details</h3>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="input-customerSignName" className="text-xs font-semibold text-gray-300">Customer Counter-Sign Name</label>
                <input
                  id="input-customerSignName"
                  type="text"
                  value={data.customerSignName}
                  onChange={(e) => handleTextChange('customerSignName', e.target.value)}
                  placeholder="e.g. DIAN EKO WIDAYANTI"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-gray-200 placeholder-gray-500 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-300">Customer Signature Drawing</span>
                <SignatureCanvas
                  id="customer-sig-pad"
                  value={data.customerSignature}
                  onChange={(base64) => handleTextChange('customerSignature', base64)}
                  placeholderText="Sign here (Customer signoff)..."
                />
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
              <span className="text-xs font-semibold text-gray-300 block">Overall Customer Satisfaction</span>
              
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleTextChange('satisfaction', val)}
                    className="p-1 cursor-pointer transition-transform duration-100 active:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        val <= data.satisfaction 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-gray-650 hover:text-gray-500'
                      } transition-colors`}
                    />
                  </button>
                ))}
                <span className="ml-2 mt-0.5 text-gray-300 font-bold">{data.satisfaction} / 5</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: APPENDIX FILES */}
        {activeTab === 'appendix' && (
          <div className="space-y-4">
            <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5 text-xs text-gray-400">
              <span className="font-semibold text-blue-400 block mb-1">📎 File Attachments</span>
              Attach documents, images (photos taken on site) or reference screenshots. Images are beautifully rendered inside both Word and PDF attachments.
            </div>

            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-all group relative">
              <input
                id="file-attachment-input"
                type="file"
                multiple
                accept="image/*,application/pdf,application/msword,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-gray-500 group-hover:text-blue-500 transition-colors mb-2" />
              <p className="mt-3 text-xs text-gray-400 font-medium">Upload Documents, Images, or Video</p>
              <p className="text-[10px] text-gray-600 mt-1">Drag and drop or click to browse</p>
            </div>

            {data.attachments.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs uppercase font-bold text-gray-500 block">Uploaded Appendix Files ({data.attachments.length})</span>
                
                {data.attachments.map((att, idx) => (
                  <div key={att.id} className="p-3 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-2 relative">
                    <button
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex gap-2.5 items-center">
                      {att.fileType.startsWith('image/') ? (
                        <img 
                          src={att.fileUrl} 
                          alt={att.fileName} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded border border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-black/40 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
                          {att.fileName.split('.').pop()?.toUpperCase() || "DOC"}
                        </div>
                      )}

                      <div className="flex-1 w-0">
                        <span className="text-gray-400 text-[10px] truncate block">{att.fileName}</span>
                        <input
                          type="text"
                          value={att.name}
                          onChange={(e) => handleAttachmentNameChange(att.id, e.target.value)}
                          placeholder="Attachment Label & Headline Description"
                          className="bg-transparent font-medium border-b border-dashed border-white/15 text-xs text-gray-200 focus:outline-none focus:border-blue-500 focus:border-solid w-full mt-0.5 pb-0.5 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
