import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ApiCustomer from "@/api";
import { Button } from "@/components/ui/button";
import { File as FileIcon, RefreshCw, X } from "lucide-react";
import { Input } from "./ui/input";
import { FaSpinner } from "react-icons/fa";
const MAX_SIZE = 10 * 1024 * 1024; 
const ALLOWED_EXT = [".pdf", ".jpg", ".jpeg", ".img"];

function extOf(name) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function caseIdFromFilename(name) {
  return name.replace(/\.[^.]+$/, "");
}

export function ErfUploader({ caseData, onUploaded, files, setFiles, user, userName }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const CASE_IDS = useMemo(() => new Set(caseData.map((e) => String(e.CaseID))), [caseData]);

  const addFiles = (incoming) => {
    const list = Array.from(incoming);

    const accepted = [];
    for (const f of list) {
      const ext = extOf(f.name);
      const base = caseIdFromFilename(f.name);

      if (!ALLOWED_EXT.includes(ext)) {
        toast.warning(`${f.name}: extension not allowed (${ext})`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        toast.warning(`${f.name}: larger than 10MB`);
        continue;
      }
      if (!CASE_IDS.has(base)) {
        toast.warning(`${f.name}: Case ID not found`);
        continue;
      }
      accepted.push(f);
    }

    setFiles((prev) => {
      const map = new Map(prev.map((p) => [`${p.name}_${p.size}`, p]));
      for (const f of accepted) map.set(`${f.name}_${f.size}`, f);
      return Array.from(map.values());
    });
  };

  const removeFile = (key) => {
    setFiles((prev) => prev.filter((f) => `${f.name}_${f.size}` !== key));
  };

  const clearAll = () => setFiles([]);

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const upload = async () => {
    if (!files.length) return toast.info("No files selected");
    setLoading(true);
    const formData = new FormData();
    for (const f of files) formData.append("files", f);

    formData.append("user", user?.id)
    formData.append("userName", user?.name)

    try {
      const res = await ApiCustomer.post("/api/case-information/erf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true, 
      });

      const data = res.data;
      const uploaded = data?.uploaded ?? 0;
      const failed = data?.failed ?? 0;
      const results = data?.results ?? [];

      if (uploaded) toast.success(`${uploaded} file(s) uploaded`);
      if (failed) {
        toast.warning(`${failed} file(s) failed`);
        for (const r of results.filter((x) => x.status === "failed")) {
          toast.error(`${r.file}: ${r.message}`);
        }
      }

      const successNames = new Set(results.filter((r) => r.status === "success").map((r) => r.file));
      setFiles((prev) => prev.filter((f) => !successNames.has(f.name)));
      onUploaded?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Upload failed");
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-lg border-2 border-dashed p-5 text-sm
                   bg-white/70 dark:bg-slate-900/50
                   border-slate-300 dark:border-slate-700"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className="font-medium">Drag & drop ERF files here</div>
        <div className="text-xs text-slate-500 mt-1">
          Allowed: {ALLOWED_EXT.join(", ")} • Max 10MB • Filename must be CaseID (e.g. 5000000001.pdf)
        </div>

        <Input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept={ALLOWED_EXT.join(",")}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.currentTarget.value = "";
          }}
          disabled={loading}
        />
      </div>

      
      {files.length > 0 && (
        <div className="rounded-lg border bg-white/80 dark:bg-slate-900/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Selected ({files.length})</div>
            <div className="flex gap-2 items-center" >
              <RefreshCw className="transition-all animate-spin" hidden={!loading}/>
              <Button variant="secondary" size="sm" onClick={clearAll} disabled={loading}>
                Clear
              </Button>
              <Button size="sm" onClick={upload} disabled={loading}>
                Upload
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((f) => {
              const key = `${f.name}_${f.size}`;
              const ext = extOf(f.name);
              const isImage = [".jpg", ".jpeg", ".img"].includes(ext); // treat .img as image if you want
              const url = isImage ? URL.createObjectURL(f) : null;

              return (
                <div key={key} className="flex items-center gap-3 rounded-md border p-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {isImage && url ? (
                      <img src={url} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileIcon className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{f.name}</div>
                    <div className="text-xs text-slate-500">
                      {(f.size / 1024 / 1024).toFixed(2)} MB • Case: {caseIdFromFilename(f.name)}
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => removeFile(key)} aria-label="Remove">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

