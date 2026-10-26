import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Plus, Search, Edit2, Trash2, FileText, Calendar, 
  User, Tag, Loader2, X, CheckCircle2, AlertCircle, Upload, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

// Helper to parse markdown content back into structured Title + Paragraph blocks for editing
const parseMarkdownToBlocks = (markdown) => {
  if (!markdown) return [{ title: '', text: '' }];
  const lines = markdown.split('\n');
  const blocks = [];
  let currentTitle = '';
  let currentText = [];

  for (let line of lines) {
    if (line.startsWith('## ')) {
      if (currentTitle || currentText.length > 0) {
        blocks.push({ title: currentTitle, text: currentText.join('\n').trim() });
        currentTitle = '';
        currentText = [];
      }
      currentTitle = line.replace('## ', '').trim();
    } else if (line.trim() !== '') {
      currentText.push(line);
    }
  }
  if (currentTitle || currentText.length > 0) {
    blocks.push({ title: currentTitle, text: currentText.join('\n').trim() });
  }
  return blocks.length > 0 ? blocks : [{ title: '', text: markdown }];
};

export default function AdminBlog() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State (English only)
  const [formData, setFormData] = useState({
    title: '',
    author: 'Noor Pro Academy',
    category: 'Learning',
    excerpt: '',
    publish_date: new Date().toISOString().split('T')[0],
    read_time: '5 min read',
    seo_title: '',
    seo_description: '',
    status: 'published',
  });

  // Block Builder State (Title + Paragraph pairs)
  const [blocks, setBlocks] = useState([{ title: '', text: '' }]);

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  // Fetch blog posts from real backend API
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/posts?includeDrafts=true`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch blog posts', err);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        author: item.author || 'Noor Pro Academy',
        category: item.category || 'Learning',
        excerpt: item.excerpt || '',
        publish_date: item.publish_date ? item.publish_date.split('T')[0] : new Date().toISOString().split('T')[0],
        read_time: item.read_time || '5 min read',
        seo_title: item.seo_title || '',
        seo_description: item.seo_description || '',
        status: item.status || 'published',
      });
      setBlocks(parseMarkdownToBlocks(item.content));
      setCoverPreview(item.cover_image || '');
      setCoverFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        author: 'Noor Pro Academy',
        category: 'Learning',
        excerpt: '',
        publish_date: new Date().toISOString().split('T')[0],
        read_time: '5 min read',
        seo_title: '',
        seo_description: '',
        status: 'published',
      });
      setBlocks([{ title: '', text: '' }]);
      setCoverPreview('');
      setCoverFile(null);
    }
    setModalOpen(true);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Block Management Helpers
  const addBlock = () => {
    setBlocks([...blocks, { title: '', text: '' }]);
  };

  const updateBlock = (index, field, value) => {
    const updated = [...blocks];
    updated[index][field] = value;
    setBlocks(updated);
  };

  const removeBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  // Compile blocks into Markdown string (Title + Paragraph structure)
  const compileMarkdown = (blks) => {
    return blks.map(b => {
      let part = '';
      if (b.title) {
        part += `\n## ${b.title}\n`;
      }
      if (b.text) {
        part += `${b.text}\n`;
      }
      return part;
    }).join('\n').trim();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast({
        title: 'Error',
        description: 'Article title is required',
        variant: 'destructive',
      });
      return;
    }
    if (!editingItem && !coverFile) {
      toast({
        title: 'Error',
        description: 'Cover image file is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const endpoint = editingItem ? `${API_URL}/api/posts/${editingItem.id}` : `${API_URL}/api/posts`;
      const method = editingItem ? 'PUT' : 'POST';

      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        dataPayload.append(key, formData[key]);
      });

      // Also set title_ar and content_ar equal to english data to keep backend schema happy
      dataPayload.append('title_ar', formData.title);
      const compiledContent = compileMarkdown(blocks);
      dataPayload.append('content', compiledContent);
      dataPayload.append('content_ar', compiledContent);

      if (coverFile) {
        dataPayload.append('cover_image', coverFile);
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataPayload,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save blog post');

      toast({
        title: 'Success',
        description: editingItem ? 'Blog post updated successfully' : 'Blog post created successfully',
      });

      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const promptDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/posts/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete blog post');

      toast({
        title: 'Deleted',
        description: 'Blog post removed successfully',
      });

      setPosts(posts.filter((p) => p.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = posts.filter((p) =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-3 sm:px-0 dir-ltr">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#112d27] tracking-tight">
            Blog Management
          </h1>
          <p className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
            Create, update, and manage academy blog posts and articles.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="ps-9 h-10 text-xs sm:text-sm font-normal border-gray-200 focus:border-[#009688] rounded-xl w-full"
            />
          </div>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl h-10 text-xs gap-1.5 shrink-0 shadow-md shadow-[#009688]/15"
          >
            <Plus className="w-4 h-4" />
            <span>Add Article</span>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 text-start">Article Title</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">Category</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">Author</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">Publish Date</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">Status</th>
                <th className="px-4 sm:px-6 py-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-normal text-[#112d27]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-normal text-xs">
                    No blog posts found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isPublished = item.status === 'published';

                  return (
                    <tr key={item.id} className="hover:bg-[#f8fcfb]/80 transition-colors">
                      <td className="px-4 sm:px-6 py-3.5 font-bold">
                        <div className="flex items-center gap-3">
                          {item.cover_image ? (
                            <img src={item.cover_image} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0 border border-gray-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#009688]/10 text-[#009688] font-bold text-xs flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <span className="truncate max-w-[130px] sm:max-w-[180px] text-[#112d27]">{item.title}</span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#009688] bg-[#009688]/10 px-2.5 py-0.5 rounded-md">
                          <Tag className="w-3 h-3" />
                          {item.category || 'General'}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-gray-600 font-normal">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[110px] sm:max-w-[140px]">{item.author || 'Noor Pro Academy'}</span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-gray-400 text-xs font-normal">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{item.publish_date ? item.publish_date.split('T')[0] : '—'}</span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md capitalize',
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          )}
                        >
                          {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>{item.status || 'published'}</span>
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(item)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-[#009688] hover:bg-[#009688]/10 rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => promptDelete(item)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form with Title & Paragraph Section Builder */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-3xl w-full p-4 sm:p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-[#112d27] text-base">
                {editingItem ? 'Edit Article' : 'Add New Article'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">Article Main Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-10 text-xs font-normal rounded-xl w-full"
                  required
                  placeholder="e.g. How to Learn English Faster"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                    placeholder="e.g. Learning"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">Author</Label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">Read Time</Label>
                  <Input
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                    placeholder="5 min read"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">Cover Image</Label>
                <div className="flex items-center gap-3">
                  {coverPreview && (
                    <img src={coverPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#009688] rounded-2xl p-3 cursor-pointer bg-gray-50/50 transition-all">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[11px] font-bold text-gray-600">Upload cover image file</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">Publish Date</Label>
                  <Input
                    type="date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-normal text-[#112d27]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">Excerpt</Label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full p-2.5 text-xs font-normal rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                  placeholder="Short summary of the article..."
                />
              </div>

              {/* Title & Paragraph Block Builder */}
              <div className="space-y-3 p-3 sm:p-4 bg-[#f8fcfb] rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#112d27]">Article Sections (Title & Paragraph)</Label>
                  <Button
                    type="button"
                    onClick={addBlock}
                    size="sm"
                    className="bg-[#009688] hover:bg-[#00796b] text-white text-[11px] font-bold h-8 rounded-lg gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </Button>
                </div>

                <div className="space-y-3">
                  {blocks.map((block, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-gray-200/80 space-y-2.5 shadow-xs relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#009688]">Section #{idx + 1}</span>
                        {blocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBlock(idx)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-gray-600">Section Title</Label>
                        <Input
                          value={block.title}
                          onChange={(e) => updateBlock(idx, 'title', e.target.value)}
                          placeholder="e.g. 1. Immerse Yourself Daily"
                          className="h-9 text-xs font-bold rounded-lg w-full"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-gray-600">Paragraph Content</Label>
                        <textarea
                          rows={3}
                          value={block.text}
                          onChange={(e) => updateBlock(idx, 'text', e.target.value)}
                          placeholder="Type your paragraph text for this section here..."
                          className="w-full p-2.5 text-xs font-normal rounded-lg border border-gray-200 focus:outline-none focus:border-[#009688]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="h-10 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#009688] hover:bg-[#00796b] text-white h-10 rounded-xl text-xs font-bold px-5 gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Article</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Popup */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#112d27] text-base">
              Delete Article
            </h3>
            <p className="text-xs text-gray-500 font-normal">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}