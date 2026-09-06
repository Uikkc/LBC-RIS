'use client';

import { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  X, 
  Loader2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface FileUploadProps {
  label?: string;
  helperText?: string;
  accept?: string;
  value?: string | null;
  onChange: (fileUrl: string | null) => void;
}

export default function FileUpload({
  label = 'แนบไฟล์เอกสารหลักฐาน (PDF / รูปภาพ)',
  helperText = 'รองรับไฟล์ PDF, Word, หรือรูปภาพหน้าปกวารสาร ขนาดไม่เกิน 25 MB',
  accept = '.pdf,.png,.jpg,.jpeg,.docx',
  value,
  onChange,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(value ? 'เอกสารหลักฐานแนบแล้ว' : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
      }

      setFileName(data.fileName);
      onChange(data.fileUrl);
    } catch (err: any) {
      setError(err.message);
      onChange(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setFileName(null);
    setError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      {value ? (
        /* Uploaded State */
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-bold text-slate-800 truncate">{fileName || 'เอกสารแนบหลักฐาน'}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>อัปโหลดเข้าสู่คลังหลักฐานแล้ว</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <span>เปิดดูไฟล์</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-colors"
              title="ลบไฟล์"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            uploading
              ? 'border-brand-primary/50 bg-rose-50/30'
              : 'border-slate-200 hover:border-brand-primary hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {uploading ? (
            <div className="flex flex-col items-center space-y-2 py-2">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              <p className="text-xs font-bold text-slate-700">กำลังอัปโหลดไฟล์เข้าสู่คลังหลักฐาน...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-brand-primary flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}