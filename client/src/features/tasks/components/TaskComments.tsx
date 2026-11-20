import { useEffect, useState, type FormEvent } from "react";
import { MessageSquare, Pencil, Trash2, X, Send } from "lucide-react";

import {
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
  type CommentItem,
} from "../comments.api";

import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import ErrorMessage from "../../../components/ui/ErrorMessage";

interface TaskCommentsProps {
  taskId: string;
}

function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [canComment, setCanComment] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [content, setContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let ignore = false;

    const fetchComments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTaskComments(taskId);

        if (!ignore) {
          setComments(response.comments);
          setCanComment(response.canComment);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load comments. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchComments();

    return () => {
      ignore = true;
    };
  }, [taskId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || submitting) return;

    try {
      setSubmitting(true);
      setActionError("");

      if (editingCommentId) {
        const updatedComment = await updateTaskComment(
          editingCommentId,
          trimmedContent,
        );

        setComments((previous) =>
          previous.map((comment) =>
            comment._id === editingCommentId ? updatedComment : comment,
          ),
        );

        setEditingCommentId(null);
      } else {
        const newComment = await createTaskComment(taskId, trimmedContent);

        setComments((previous) => [...previous, newComment]);
      }

      setContent("");
    } catch {
      setActionError("Unable to save comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment: CommentItem) => {
    setEditingCommentId(comment._id);
    setContent(comment.content);
    setActionError("");
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setContent("");
    setActionError("");
  };

  const handleDelete = async (commentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) return;

    try {
      setDeletingCommentId(commentId);
      setActionError("");

      await deleteTaskComment(commentId);

      setComments((previous) =>
        previous.filter((comment) => comment._id !== commentId),
      );

      if (editingCommentId === commentId) {
        cancelEdit();
      }
    } catch {
      setActionError("Unable to delete comment. Please try again.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <MessageSquare size={20} className="text-indigo-600" />

        <h2 className="font-semibold text-slate-900">
          Comments ({comments.length})
        </h2>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading comments..." />
      ) : error ? (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-5">
            {comments.length === 0 ? (
              <p className="py-5 text-center text-sm text-slate-500">
                No comments yet.
              </p>
            ) : (
              comments.map((comment) => (
                <article
                  key={comment._id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {comment.author.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(comment.createdAt)}
                        {comment.updatedAt !== comment.createdAt && (
                          <span> · Edited</span>
                        )}
                      </p>
                    </div>

                    {comment.canEdit && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(comment)}
                          disabled={submitting || deletingCommentId !== null}
                          aria-label="Edit comment"
                          className="rounded-md p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(comment._id)}
                          disabled={deletingCommentId !== null || submitting}
                          aria-label="Delete comment"
                          className="rounded-md p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingCommentId === comment._id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">
                    {comment.content}
                  </p>
                </article>
              ))
            )}
          </div>

          {actionError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {actionError}
            </p>
          )}

          {canComment ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6 border-t border-slate-100 pt-5"
            >
              <label
                htmlFor="task-comment"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {editingCommentId ? "Edit your comment" : "Add a comment"}
              </label>

              <textarea
                id="task-comment"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your comment..."
                rows={3}
                maxLength={2000}
                required
                disabled={submitting}
                className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />

              <div className="mt-3 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                {editingCommentId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} />
                  {submitting
                    ? "Saving..."
                    : editingCommentId
                      ? "Update Comment"
                      : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-500">
              Comments are currently read-only for this workspace.
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default TaskComments;
