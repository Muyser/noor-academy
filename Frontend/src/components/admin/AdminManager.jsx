import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminManager({ entityName, title, columns, formFields, defaultValues = {}, sortBy = '-created_date', filter = {} }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(defaultValues);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities[entityName].filter(filter, sortBy, 100)
      .then(setRecords)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData(defaultValues);
    setShowForm(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setFormData({ ...defaultValues, ...record });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const clean = { ...formData };
      formFields.forEach((f) => {
        if (f.type === 'array' && typeof clean[f.key] === 'string') {
          clean[f.key] = clean[f.key].split('\n').filter((x) => x.trim());
        }
        if (f.type === 'number' && clean[f.key] !== '') {
          clean[f.key] = Number(clean[f.key]);
        }
      });
      delete clean.id;
      delete clean.created_date;
      delete clean.updated_date;
      delete clean.created_by_id;
      if (editing) {
        await base44.entities[entityName].update(editing.id, clean);
      } else {
        await base44.entities[entityName].create(clean);
      }
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await base44.entities[entityName].delete(id);
      load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const filtered = records.filter((r) =>
    !search || columns.some((c) => String(r[c.key] || '').toLowerCase().includes(search.toLowerCase()))
  );

  const renderField = (field) => {
    const value = formData[field.key] ?? '';
    const setVal = (v) => setFormData({ ...formData, [field.key]: v });
    if (field.type === 'textarea') {
      return <Textarea value={value} onChange={(e) => setVal(e.target.value)} rows={4} className="border-brand-line focus:border-brand-teal" />;
    }
    if (field.type === 'array') {
      return <Textarea value={Array.isArray(value) ? value.join('\n') : value} onChange={(e) => setVal(e.target.value)} rows={4} placeholder="One item per line" className="border-brand-line focus:border-brand-teal" />;
    }
    if (field.type === 'select') {
      return (
        <select value={value} onChange={(e) => setVal(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-brand-line bg-white text-sm focus:outline-none focus:border-brand-teal">
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (field.type === 'number') {
      return <Input type="number" value={value} onChange={(e) => setVal(e.target.value)} className="h-10 border-brand-line focus:border-brand-teal" />;
    }
    return <Input value={value} onChange={(e) => setVal(e.target.value)} className="h-10 border-brand-line focus:border-brand-teal" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-brand-ink">{title}</h1>
        <Button onClick={openCreate} className="bg-brand-teal hover:bg-brand-teal-dark text-white gap-2">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9 h-10 border-brand-line" />
      </div>

      <div className="bg-white rounded-2xl border border-brand-line overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-bg text-brand-muted text-xs uppercase tracking-wider">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="text-start px-4 py-3 font-semibold">{c.label}</th>
                ))}
                <th className="text-end px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-10 text-brand-muted">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-10 text-brand-muted">No records found.</td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-brand-bg/50">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-brand-ink">
                        {c.render ? c.render(record) : String(record[c.key] ?? '').substring(0, 60)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(record)} className="p-1.5 rounded-lg hover:bg-brand-teal/10 text-brand-teal">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(record.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-brand-line px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-brand-ink">{editing ? 'Edit' : 'Create'} {title}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-brand-bg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-brand-ink text-sm">{field.label}</Label>
                  {renderField(field)}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="bg-brand-teal hover:bg-brand-teal-dark text-white gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-brand-line">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}