import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

export function UploadArea({ onUpload }: { onUpload: (file: { name: string; type: string }) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    onUpload({ name: file.name, type: file.type });
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
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
        dragging ? 'border-accent bg-accent-soft' : 'border-border hover:border-border-hover bg-bg-secondary'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.eml,.msg"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-text-tertiary mb-3">
        <UploadCloud size={24} />
      </div>
      <div className="text-sm font-medium text-text-primary">Drop files here or click to upload</div>
      <div className="text-xs text-text-tertiary mt-1">PDF, images, receipts, emails — LifeOS will extract what matters</div>
    </div>
  );
}
