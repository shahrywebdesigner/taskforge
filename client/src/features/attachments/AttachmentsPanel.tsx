import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
  Paperclip,
  Upload,
  Link as LinkIcon,
  FileText,
  Trash2,
  ExternalLink,
} from 'lucide-react'

import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

import {
  getAttachments,
  uploadAttachment,
  createAttachmentLink,
  deleteAttachment,
  type AttachmentItem,
  type AttachmentScope,
} from "./attachment.api";

interface AttachmentsPanelProps {
  scope: AttachmentScope;
  targetId: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function AttachmentsPanel({ scope, targetId }: AttachmentsPanelProps) {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

useEffect(() => {
  let ignore = false

  const loadAttachments = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAttachments(scope, targetId)

      if (!ignore) {
        setAttachments(data)
      }
    } catch {
      if (!ignore) {
        setError('Unable to load attachments.')
      }
    } finally {
      if (!ignore) {
        setLoading(false)
      }
    }
  }

  void loadAttachments()

  return () => {
    ignore = true
  }
}, [scope, targetId])

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setActionError("File size cannot exceed 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setActionError("");

      const attachment = await uploadAttachment(
        scope,
        targetId,
        file,
        setUploadProgress,
      );

      setAttachments((previous) => [attachment, ...previous]);
    } catch {
      setActionError(
        "Unable to upload file. Check your permissions and try again.",
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!linkTitle.trim() || !linkUrl.trim() || addingLink) return;

    try {
      setAddingLink(true);
      setActionError("");

      const attachment = await createAttachmentLink(
        scope,
        targetId,
        linkTitle.trim(),
        linkUrl.trim(),
      );

      setAttachments((previous) => [attachment, ...previous]);
      setLinkTitle("");
      setLinkUrl("");
    } catch {
      setActionError("Unable to add link. Please check the URL and try again.");
    } finally {
      setAddingLink(false);
    }
  };

  const handleDelete = async (attachment: AttachmentItem) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      setDeletingId(attachment._id);
      setActionError("");

      await deleteAttachment(scope, targetId, attachment._id);

      setAttachments((previous) =>
        previous.filter((item) => item._id !== attachment._id),
      );
    } catch {
      setActionError(
        "Unable to delete attachment. You may not have permission.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (size?: number) => {
    if (size === undefined) return "";

    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (attachment: AttachmentItem) =>
    attachment.mimeType?.startsWith("image/");

  return (
    <Card>
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Paperclip size={20} className="text-indigo-600" />
        <h2 className="font-semibold text-slate-900">
          Attachments ({attachments.length})
        </h2>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload File"}
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>

          <p className="mt-2 text-xs text-slate-500">
            Images and documents · Maximum file size 10 MB
          </p>

          {uploading && (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <form
          onSubmit={handleAddLink}
          className="space-y-3 border-t border-slate-100 pt-5"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <LinkIcon size={16} />
            Add External Link
          </h3>

          <input
            value={linkTitle}
            onChange={(event) => setLinkTitle(event.target.value)}
            placeholder="Link title"
            maxLength={150}
            required
            disabled={addingLink}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />

          <input
            type="url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://example.com"
            maxLength={2048}
            required
            disabled={addingLink}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={addingLink || !linkTitle.trim() || !linkUrl.trim()}
            className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
          >
            {addingLink ? "Adding..." : "Add Link"}
          </button>
        </form>

        {actionError && (
          <p role="alert" className="text-sm text-red-600">
            {actionError}
          </p>
        )}

        {loading ? (
          <LoadingSpinner message="Loading attachments..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : attachments.length === 0 ? (
          <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            No attachments added yet.
          </p>
        ) : (
          <div className="space-y-3 border-t border-slate-100 pt-5">
            {attachments.map((attachment) => (
              <div
                key={attachment._id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
              >
                {isImage(attachment) && attachment.fileUrl ? (
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.originalName || "Attachment"}
                      className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                    />
                  </a>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    {attachment.kind === "link" ? (
                      <LinkIcon size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="break-all text-sm font-medium text-slate-800">
                    {attachment.kind === "link"
                      ? attachment.title
                      : attachment.originalName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {attachment.uploadedBy?.name || "Unknown"}
                    {attachment.size !== undefined &&
                      ` · ${formatSize(attachment.size)}`}
                  </p>

                  <a
                    href={
                      attachment.kind === "link"
                        ? attachment.url
                        : attachment.fileUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                  >
                    {attachment.kind === "link" ? "Visit Link" : "Open File"}
                    <ExternalLink size={13} />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(attachment)}
                  disabled={deletingId !== null}
                  aria-label="Delete attachment"
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  {deletingId === attachment._id ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default AttachmentsPanel;
