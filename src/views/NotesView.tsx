import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Archive,
  Search,
  Tag,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { Note } from '../types';
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from '../services/storage';
import { formatUzbekDate } from '../utils/dateUtils';

interface NotesViewProps {
  onOpenQuickAdd: (tab?: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onOpenQuickAdd }) => {
  const notes = getNotes();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Edit form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Collect all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  );

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTagsInput((note.tags || []).join(', '));
  };

  const saveEdit = () => {
    if (!editingNote) return;
    updateNote(editingNote.id, {
      title: title.trim() || 'Nomsiz qayd',
      content: content.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setEditingNote(null);
  };

  const handleTogglePin = (note: Note) => {
    updateNote(note.id, { isPinned: !note.isPinned });
  };

  const handleToggleArchive = (note: Note) => {
    updateNote(note.id, { isArchived: !note.isArchived });
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (selectedTag && !n.tags?.includes(selectedTag)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned && !n.isArchived);
  const regularNotes = filteredNotes.filter((n) => !n.isPinned && !n.isArchived);
  const archivedNotes = filteredNotes.filter((n) => n.isArchived);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0D1424] border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Qaydlar va intellektual xotira</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dars konspektlari, loyiha g‘oyalari va muhim fikrlarni yagona joyda saqlang
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('note')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi qayd</span>
        </button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Qaydlardan qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === null
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Barcha teglar
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B14]/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0D1424] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Qaydni tahrirlash</h3>
              <button
                onClick={() => setEditingNote(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sarlavha</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mazmun</label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teglar (vergul bilan)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Bekor qilish
              </button>
              <button
                onClick={saveEdit}
                className="px-5 py-2 rounded-xl bg-[#00E5FF] text-slate-950 font-bold text-xs"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[#0D1424] border border-slate-800 p-8">
          <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3 stroke-1" />
          <h3 className="text-base font-bold text-white">Qaydlar mavjud emas</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Muhim ma'lumotlar, formulalar yoki rejalar haqida birinchi qaydnomangizni yozing.
          </p>
          <button
            onClick={() => onOpenQuickAdd('note')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Qayd yaratish</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Pin className="w-3.5 h-3.5 fill-amber-400" />
                <span>Qadalgan qaydlar ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}

          {/* Regular notes */}
          {regularNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && (
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Boshqa qaydlar ({regularNotes.length})
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}

          {/* Archived notes */}
          {archivedNotes.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Archive className="w-3.5 h-3.5" />
                <span>Arxivlangan qaydlar ({archivedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {archivedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function renderNoteCard(note: Note) {
    return (
      <div
        key={note.id}
        className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all group"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
              {note.title}
            </h3>
            <button
              onClick={() => handleTogglePin(note)}
              className={`p-1 rounded-lg transition-colors ${
                note.isPinned
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-slate-600 hover:text-slate-300'
              }`}
              title={note.isPinned ? 'Qadalishni bekor qilish' : 'Qadab qo‘yish'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-6 leading-relaxed">
            {note.content}
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300/80 font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{formatUzbekDate(note.createdAt.slice(0, 10), false)}</span>
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEdit(note)}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Tahrirlash"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleToggleArchive(note)}
                className="p-1 rounded text-slate-400 hover:text-white"
                title={note.isArchived ? 'Arxivdan chiqarish' : 'Arxivlash'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteNote(note.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-400"
                title="O‘chirish"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
