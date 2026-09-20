import { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Mail } from 'lucide-react';

export function UploadArea({ onUpload }: { onUpload: (file: { name: string; type: string; fileObj?: File }) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    onUpload({ name: file.name, type: file.type, fileObj: file });
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
        dragging
          ? 'border-accent bg-accent-soft/50 scale-[0.99]'
          : 'border-white/10 hover:border-white/20 bg-[#0d0f15] hover:bg-[#12151f]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.eml,.msg"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 text-accent border border-accent/20 mb-4 shadow-lg shadow-blue-500/10">
        <UploadCloud size={28} />
      </div>
      
      <div className="text-sm font-bold text-text-primary">Drop files here or click to upload</div>
      <div className="text-xs text-text-tertiary mt-1.5 max-w-sm mx-auto">
        PDFs, Images, Receipts, Certificates, Emails — LifeOS will analyze, extract actions, and connect relationships automatically.
      </div>

      <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-white/5 text-[11px] text-text-tertiary">
        <span className="flex items-center gap-1 font-medium"><FileText size={12} className="text-blue-400" /> PDF</span>
        <span>•</span>
        <span className="flex items-center gap-1 font-medium"><ImageIcon size={12} className="text-emerald-400" /> PNG / JPG</span>
        <span>•</span>
        <span className="flex items-center gap-1 font-medium"><Mail size={12} className="text-purple-400" /> Email</span>
      </div>
    </div>
  );
}
