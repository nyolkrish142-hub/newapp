import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaBold, FaItalic, FaHeading, FaListUl, FaLink, FaImage } from "react-icons/fa";
import { adminApi } from "./adminAuth";

import { BACKEND_URL as BACKEND } from "@/lib/api";
const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm text-slate-900 bg-white";
const EMPTY = { title: "", excerpt: "", content: "", status: "published" };

const AdminBlogs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const editorRef = useRef(null);

  const load = () => {
    setLoading(true);
    adminApi
      .get("/admin/blogs")
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch((err) => toast.error(err?.response?.data?.detail || "Load failed"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (open && editorRef.current) editorRef.current.innerHTML = form.content || "";
  }, [open]); // eslint-disable-line

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setImage(null);
    setOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ title: b.title, excerpt: b.excerpt || "", content: b.content || "", status: b.status || "published" });
    setImage(null);
    setOpen(true);
  };

  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
  };

  const addLink = () => {
    const url = window.prompt("Link URL:");
    if (url) exec("createLink", url);
  };

  const save = async (e) => {
    e.preventDefault();
    const content = editorRef.current?.innerHTML || "";
    if (!form.title.trim()) return toast.error("Title zaroori hai");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("excerpt", form.excerpt);
      fd.append("content", content);
      fd.append("status", form.status);
      if (image) fd.append("image", image);
      if (editing) {
        fd.append("slug", editing.slug || "");
        await adminApi.put(`/admin/blogs/${editing.id}`, fd);
        toast.success("Blog update ho gaya");
      } else {
        await adminApi.post("/admin/blogs", fd);
        toast.success("Naya blog publish ho gaya");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`"${b.title}" delete karein?`)) return;
    try {
      await adminApi.delete(`/admin/blogs/${b.id}`);
      toast.success("Blog delete ho gaya");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div data-testid="admin-blogs-page">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Manage Blogs</h1>
          <p className="text-sm text-slate-600">Haryana Jobs se jude articles likhein — {items.length} blogs.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-2 shadow"
          data-testid="admin-add-blog-btn"
        >
          <FaPlus /> New Blog
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100" data-testid="admin-blogs-list">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm" data-testid="admin-blogs-empty">Koi blog nahi hai — pehla article likhein!</div>
        ) : (
          items.map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60" data-testid={`admin-blog-row-${b.id}`}>
              {b.image_url ? (
                <img src={`${BACKEND}${b.image_url}`} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 grid place-items-center shrink-0 text-slate-300"><FaImage /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{b.title}</p>
                <p className="text-xs text-slate-400 truncate">{b.excerpt || b.slug}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${b.status === "published" ? "text-green-700 bg-green-50" : "text-slate-500 bg-slate-100"}`}>{b.status}</span>
              <a href={`/blogs/${b.slug}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-700 hover:underline shrink-0">View</a>
              <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" data-testid={`admin-edit-blog-${b.id}`}><FaEdit /></button>
              <button onClick={() => remove(b)} className="p-2 rounded-lg text-red-500 hover:bg-red-50" data-testid={`admin-delete-blog-${b.id}`}><FaTrash /></button>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8 px-4" data-testid="admin-blog-dialog">
          <form onSubmit={save} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit Blog" : "New Blog"}</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5" data-testid="admin-blog-cancel">
                  <FaTimes /> Cancel
                </button>
                <button type="submit" disabled={busy} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5" data-testid="admin-blog-save">
                  <FaSave /> {busy ? "Saving…" : editing ? "Update" : "Publish"}
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Blog Title *" className={`${inputCls} font-bold text-lg`} data-testid="admin-blog-title" />
              <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short excerpt (listing card par dikhega)" className={inputCls} data-testid="admin-blog-excerpt" />

              <div>
                <div className="flex items-center gap-1 border border-slate-300 border-b-0 rounded-t-lg bg-slate-50 px-2 py-1.5">
                  <button type="button" onClick={() => exec("bold")} title="Bold" className="p-2 rounded hover:bg-slate-200 text-slate-600" data-testid="editor-bold"><FaBold /></button>
                  <button type="button" onClick={() => exec("italic")} title="Italic" className="p-2 rounded hover:bg-slate-200 text-slate-600" data-testid="editor-italic"><FaItalic /></button>
                  <button type="button" onClick={() => exec("formatBlock", "<h2>")} title="Heading" className="p-2 rounded hover:bg-slate-200 text-slate-600" data-testid="editor-h2"><FaHeading /></button>
                  <button type="button" onClick={() => exec("insertUnorderedList")} title="Bullet list" className="p-2 rounded hover:bg-slate-200 text-slate-600" data-testid="editor-list"><FaListUl /></button>
                  <button type="button" onClick={addLink} title="Add link" className="p-2 rounded hover:bg-slate-200 text-slate-600" data-testid="editor-link"><FaLink /></button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[260px] border border-slate-300 rounded-b-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-white leading-relaxed"
                  data-testid="admin-blog-content-editor"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cover Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="mt-1 w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    data-testid="admin-blog-image"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</span>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={`${inputCls} mt-1`} data-testid="admin-blog-status">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
