import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck,
  Server,
  Layers
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSchemaModal: React.FC<SupabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-pink-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E75480] text-white flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Supabase Database & Storage Setup</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                PostgreSQL tables: products, orders, order_items & product-images bucket
              </p>
            </div>
          </div>
          <button
            id="close-schema-modal-btn"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isSupabaseConfigured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <p className="text-xs font-semibold">
                  {isSupabaseConfigured ? 'Supabase Client Connected' : 'Running in Local Storage Demo Mode'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isSupabaseConfigured 
                    ? 'Your application is querying live Supabase tables and Storage bucket.' 
                    : 'To connect to your cloud Supabase database, copy the SQL below and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.'}
                </p>
              </div>
            </div>

            <button
              id="copy-sql-btn"
              onClick={handleCopy}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          {/* Quick instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100">
              <span className="font-semibold text-[#E75480] block mb-1">1. Run SQL in Supabase</span>
              <p className="text-slate-600 text-[11px]">Open Supabase Dashboard → SQL Editor → Paste and click <strong>Run</strong>.</p>
            </div>
            <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100">
              <span className="font-semibold text-[#E75480] block mb-1">2. Storage Bucket</span>
              <p className="text-slate-600 text-[11px]">Creates <code>product-images</code> public bucket for gift photo uploads.</p>
            </div>
            <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100">
              <span className="font-semibold text-[#E75480] block mb-1">3. Row Level Security</span>
              <p className="text-slate-600 text-[11px]">Pre-configures RLS policies for products, orders, and order items.</p>
            </div>
          </div>

          {/* SQL Script View */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-700">Ready-to-Execute PostgreSQL DDL Script:</span>
              <button
                onClick={handleCopy}
                className="text-xs text-[#E75480] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#E75480] hover:bg-[#D6336C] text-white text-xs font-medium rounded-full transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
