import { useState, useEffect } from "react";
import { useAuth } from "~/modules/authentication";
import { UserRole } from "~/modules/authentication/authentication.types";
import { FolderOpen, Upload, FileText, Trash2, Download, Plus } from "lucide-react";

interface RfqDocument {
  _id: string;
  documentType: string;
  filename: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedByName: string;
  createdAt: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  PROFORMA_INVOICE: "Proforma Invoice",
  BILL_OF_LADING: "Bill of Lading",
  PACKING_LIST: "Packing List",
  OTHER: "Other",
};

export function DocumentHub({ rfqId }: { rfqId: string }) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<RfqDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [docType, setDocType] = useState("PROFORMA_INVOICE");

  const isSalesOrAdmin =
    user?.role === UserRole.Sales || user?.role === UserRole.Admin;

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await window.fetch(`/api/rfqs/${rfqId}/documents`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setDocs(json.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, [rfqId]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File;
    if (!file) return;

    setUploading(true);
    try {
      // First upload file via uploader
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const uploadRes = await window.fetch("/api/uploader/document", {
        method: "POST",
        credentials: "include",
        body: uploadForm,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) throw new Error(uploadJson.message);

      const { url, path: storagePath, originalname, size, mimeType } = uploadJson.data;

      // Register document
      const docRes = await window.fetch(`/api/rfqs/${rfqId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          documentType: docType,
          filename: originalname,
          fileUrl: url,
          storagePath,
          fileSize: size,
          mimeType,
        }),
      });
      const docJson = await docRes.json();
      if (docJson.success) {
        setDocs((prev) => [docJson.data, ...prev]);
        setShowUpload(false);
      }
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      await window.fetch(`/api/rfqs/${rfqId}/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setDocs((prev) => prev.filter((d) => d._id !== docId));
    } catch {}
  };

  return (
    <div className="bg-card border border-border rounded-md">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-foreground">Document Hub</h3>
        </div>
        {isSalesOrAdmin && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-1.5 text-xs text-accent border border-accent/40 px-2.5 py-1 rounded-sm hover:bg-accent/10 transition-colors"
          >
            <Plus className="w-3 h-3" strokeWidth={2} />
            Upload
          </button>
        )}
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="p-4 border-b border-border bg-muted/20 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="bg-card border border-border rounded-sm text-sm text-foreground px-3 py-1.5 w-full focus:outline-none focus:border-accent"
            >
              {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">File (PDF)</label>
            <input
              type="file"
              name="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              required
              className="text-sm text-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-sm hover:opacity-90 disabled:opacity-50"
          >
            <Upload className="w-3 h-3" strokeWidth={1.5} />
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      )}

      <div className="p-4">
        {loading ? (
          <div className="text-center py-6 text-muted-foreground text-xs">Loading documents...</div>
        ) : docs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" strokeWidth={1} />
            <p className="text-xs">No documents yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-sm hover:border-accent/30 transition-colors"
              >
                <FileText className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{doc.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType} · {doc.uploadedByName} · {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:opacity-70"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                  {isSalesOrAdmin && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
