import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderPlus, Plus, Search, Pin, Trash2, Edit, FileText, 
  Check, Hash, Columns, BookOpen
} from 'lucide-react';
import { useStore } from '../store/useStore';
import Markdown from 'react-markdown';

export default function NotebookComponent() {
  const theme = useStore((state) => state.theme);
  const notes = useStore((state) => state.notes);
  const notebooks = useStore((state) => state.notebooks);
  const addNote = useStore((state) => state.addNote);
  const updateNote = useStore((state) => state.updateNote);
  const deleteNote = useStore((state) => state.deleteNote);
  const addNotebook = useStore((state) => state.addNotebook);
  const deleteNotebook = useStore((state) => state.deleteNotebook);

  const [activeNotebookId, setActiveNotebookId] = useState<string>('all');
  const [activeNoteId, setActiveNoteId] = useState<string>(() => notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('split');

  // New item states
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookIcon, setNewNotebookIcon] = useState('📓');
  const [isAddingNotebook, setIsAddingNotebook] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active note state mirroring for immediate UI responsiveness & auto-save
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTagsString, setEditTagsString] = useState('');

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  useEffect(() => {
    if (activeNote) {
      if (activeNote.id !== activeNoteId) {
        setActiveNoteId(activeNote.id);
      }
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setEditTagsString(activeNote.tags.join(', '));
    } else {
      setActiveNoteId('');
      setEditTitle('');
      setEditContent('');
      setEditTagsString('');
    }
  }, [activeNote?.id]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Auto save trigger only when local draft actually diverges from stored note
  useEffect(() => {
    if (!activeNote) return;
    const parsedTags = editTagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const hasChanges =
      editTitle !== activeNote.title ||
      editContent !== activeNote.content ||
      parsedTags.join(',') !== activeNote.tags.join(',');

    if (!hasChanges) return;

    const delay = setTimeout(() => {
      updateNote(activeNote.id, {
        title: editTitle,
        content: editContent,
        tags: parsedTags
      });
      showToast('Notebook auto-saved');
    }, 900);

    return () => clearTimeout(delay);
  }, [editTitle, editContent, editTagsString, activeNote]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCreateNote = () => {
    const notebookId = activeNotebookId === 'all' ? undefined : activeNotebookId;
    const createdId = addNote({
      title: 'New Workspace Draft',
      content: 'Write something spectacular...',
      tags: ['Draft'],
      isPinned: false,
      notebookId
    });
    setActiveNoteId(createdId);
    showToast('New note created successfully');
  };

  const handleCreateNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    addNotebook({
      name: newNotebookName.trim(),
      icon: newNotebookIcon || '📓'
    });
    setNewNotebookName('');
    setIsAddingNotebook(false);
    showToast('Notebook category added');
  };

  const handleDeleteActiveNote = () => {
    if (!activeNote) return;
    deleteNote(activeNote.id);
    setActiveNoteId('');
    showToast('Draft removed successfully');
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesNotebook = activeNotebookId === 'all' || note.notebookId === activeNotebookId;
    const matchesSearch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesNotebook && matchesSearch;
  });

  const cardClass = `backdrop-blur-md rounded-2xl border p-4 transition-all ${
    theme === 'dark' 
      ? 'bg-slate-900/60 border-slate-800 text-white' 
      : 'bg-white/60 border-indigo-100/80 text-indigo-950'
  }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden relative pb-10">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-indigo-950 text-white font-mono text-[10px] uppercase font-black tracking-widest px-4 py-3 rounded-xl border border-indigo-500 shadow-xl flex items-center gap-2"
          >
            <Check className="h-4.5 w-4.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Column: Folders & Notebook Categories */}
      <div className="md:col-span-3 space-y-4 flex flex-col h-full overflow-y-auto pr-1 scrollbar-none">
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">Notebook categories</h3>
            <button 
              onClick={() => setIsAddingNotebook(!isAddingNotebook)}
              className="p-1 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>

          {isAddingNotebook && (
            <form onSubmit={handleCreateNotebook} className="space-y-2 mb-3">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Icon"
                  value={newNotebookIcon}
                  onChange={(e) => setNewNotebookIcon(e.target.value)}
                  className="w-12 text-center text-xs p-1.5 rounded-lg border border-indigo-100 dark:border-slate-800 dark:bg-slate-950 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Notebook title..."
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  className="flex-1 text-xs p-1.5 rounded-lg border border-indigo-100 dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div className="flex justify-end gap-1.5">
                <button 
                  type="button" 
                  onClick={() => setIsAddingNotebook(false)}
                  className="px-2 py-1 text-[10px] font-black text-pink-500 uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-2.5 py-1 text-[10px] bg-indigo-600 text-white font-black uppercase rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1">
            <button
              onClick={() => setActiveNotebookId('all')}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeNotebookId === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-indigo-50/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>🌎 All Notebooks</span>
              <span className="text-[10px] opacity-60 font-mono">{notes.length}</span>
            </button>

            {notebooks.map((nb) => {
              const count = notes.filter((n) => n.notebookId === nb.id).length;
              return (
                <div key={nb.id} className="group relative flex items-center justify-between">
                  <button
                    onClick={() => setActiveNotebookId(nb.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeNotebookId === nb.id
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-indigo-50/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{nb.icon} {nb.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">{count}</span>
                  </button>
                  {nb.id !== 'inbox-notebook' && (
                    <button
                      onClick={() => deleteNotebook(nb.id)}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-pink-500 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes Search & List */}
        <div className={`${cardClass} flex-1 flex flex-col overflow-hidden min-h-[300px]`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">Notes List</h3>
            <button 
              onClick={handleCreateNote}
              className="p-1 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-1 text-[10px] font-black uppercase"
            >
              <Plus className="h-3.5 w-3.5" /> Note
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-indigo-400" />
            <input
              type="text"
              placeholder="Search active notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl focus:outline-none border ${
                theme === 'dark' 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' 
                  : 'bg-indigo-50/50 border-indigo-100 text-indigo-950 placeholder:text-indigo-300'
              }`}
            />
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-[11px] text-indigo-300 font-semibold leading-relaxed">
                No matching draft found in this workspace folder.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all relative block ${
                      isActive
                        ? 'bg-indigo-50/80 border-indigo-400 dark:bg-slate-800 dark:border-indigo-500'
                        : 'border-transparent hover:bg-indigo-50/30 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold truncate max-w-[130px]">{note.title || 'Untitled Note'}</span>
                      <div className="flex gap-1">
                        {note.isPinned && <Pin className="h-3 w-3 text-pink-500 shrink-0" />}
                      </div>
                    </div>
                    <div className="text-[10px] text-indigo-400 font-medium truncate mt-0.5">
                      {note.content.replace(/[#*`]/g, '').slice(0, 45) || 'No content...'}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {note.tags.map((tag) => (
                        <span key={tag} className="text-[8px] font-mono font-bold bg-indigo-100 dark:bg-slate-900 text-indigo-600 px-1.5 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Markdown Editor / Preview dual screen */}
      <div className="md:col-span-9 h-full flex flex-col space-y-4">
        {activeNote ? (
          <div className={`${cardClass} flex-1 flex flex-col overflow-hidden`}>
            {/* Note Editor Header bar */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-50 dark:border-slate-800 select-none">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateNote(activeNoteId, { isPinned: !activeNote.isPinned })}
                  className={`p-1.5 rounded-lg transition-colors ${activeNote.isPinned ? 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' : 'text-indigo-400'}`}
                  title="Pin note"
                >
                  <Pin className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDeleteActiveNote}
                  className="p-1.5 rounded-lg text-pink-500 hover:bg-pink-50 dark:hover:bg-slate-800 transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-slate-950 p-1 rounded-xl border border-indigo-100/50 dark:border-slate-900">
                <button
                  onClick={() => setEditorMode('edit')}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 transition-all ${
                    editorMode === 'edit' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-indigo-400'
                  }`}
                >
                  <Edit className="h-3 w-3" /> Write
                </button>
                <button
                  onClick={() => setEditorMode('split')}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 transition-all ${
                    editorMode === 'split' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-indigo-400'
                  }`}
                >
                  <Columns className="h-3 w-3" /> Split
                </button>
                <button
                  onClick={() => setEditorMode('preview')}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 transition-all ${
                    editorMode === 'preview' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-indigo-400'
                  }`}
                >
                  <BookOpen className="h-3 w-3" /> Preview
                </button>
              </div>
            </div>

            {/* Title & Tags Input */}
            <div className="py-4 space-y-2 border-b border-indigo-50 dark:border-slate-800">
              <input
                type="text"
                placeholder="Enter note title..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-transparent text-lg md:text-xl font-black focus:outline-none placeholder:text-indigo-300"
              />
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tags separated by commas..."
                  value={editTagsString}
                  onChange={(e) => setEditTagsString(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono font-bold text-indigo-400 focus:outline-none placeholder:text-indigo-200"
                />
              </div>
            </div>

            {/* Split Screen Panel */}
            <div className="flex-1 flex overflow-hidden min-h-[300px]">
              {/* Writer TextArea */}
              {(editorMode === 'edit' || editorMode === 'split') && (
                <textarea
                  placeholder="# Write your Markdown text here..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={`flex-1 h-full p-4 resize-none bg-transparent font-mono text-xs leading-relaxed focus:outline-none overflow-y-auto scrollbar-thin border-r ${
                    theme === 'dark' ? 'border-slate-800 text-indigo-100' : 'border-indigo-50 text-indigo-950'
                  }`}
                />
              )}

              {/* Render Previewer */}
              {(editorMode === 'preview' || editorMode === 'split') && (
                <div className="flex-1 h-full p-4 overflow-y-auto scrollbar-thin select-text">
                  <div className="markdown-body prose prose-indigo dark:prose-invert max-w-none text-xs leading-relaxed">
                    <Markdown
                      components={{
                        h1: ({ children }) => <h1 className="text-sm font-black border-b border-indigo-100 dark:border-slate-800 pb-1 mt-3 mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xs font-black mt-3 mb-1">{children}</h2>,
                        ul: ({ children }) => <ul className="list-disc pl-5 my-1.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed text-[11px]">{children}</li>,
                        code: ({ children }) => (
                          <code className="bg-indigo-50 dark:bg-slate-950 border border-indigo-100/50 dark:border-slate-800 px-1 py-0.5 rounded text-pink-600 font-mono text-[10px]">
                            {children}
                          </code>
                        ),
                        p: ({ children }) => <p className="text-[11.5px] leading-relaxed my-1.5">{children}</p>
                      }}
                    >
                      {editContent}
                    </Markdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`${cardClass} flex-1 flex flex-col items-center justify-center p-8 text-center`}>
            <div className="p-3 bg-indigo-50 dark:bg-slate-800 rounded-full text-indigo-500 mb-3 animate-pulse">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-black tracking-tight">No Active Draft Selected</h4>
            <p className="text-xs text-indigo-400 max-w-xs leading-relaxed mt-1">
              Select an existing draft from the list or create a brand new Workspace draft to begin.
            </p>
            <button
              onClick={handleCreateNote}
              className="mt-4 px-4 py-2 text-xs font-black uppercase tracking-wider bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              Add note draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
