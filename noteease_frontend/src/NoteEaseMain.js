import React, { useState, useRef } from 'react';

// Helper: color palette for tags, works in both themes
const TAG_PALETTE = [
  '#4A90E2', '#F5A623', '#50E3C2', '#B8E986', '#F8E71C', '#D7263D', '#522E92'
];

// Helper to get a color for a tag based on name
function getTagColor(tag) {
  // Simple hash for unique color per tag from accent palette
  const palette = [
    '#4A90E2', '#F5A623', '#50E3C2', '#B8E986', '#F8E71C', '#D7263D', '#522E92'
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) { hash = tag.charCodeAt(i) + ((hash << 5) - hash); }
  return palette[Math.abs(hash) % palette.length];
}

/**
 * PUBLIC_INTERFACE
 * Main container for the NoteEase app – handles notes and theme.
 */
function NoteEaseMain({ theme, toggleTheme }) {
  // Notes state: {id, title, content, tags: [], lastEdited}
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [editNoteDraft, setEditNoteDraft] = useState({ title: '', content: '', tags: [] });
  const searchRef = useRef();

  // All theme colors use CSS variables for consistency
  const COLORS = {
    primary: getCssVar('--base-light', '#4A90E2').trim() || '#4A90E2',
    secondary: getCssVar('--base-dark', '#fff').trim() || '#fff',
    accent: getCssVar('--accent', '#F5A623').trim() || '#F5A623',
    text: getCssVar('--text-color', '#181A1B').trim() || '#181A1B',
    textSecondary: getCssVar('--text-secondary', '#bbb').trim() || '#bbb',
    border: getCssVar('--border-color', '#E0E0E0').trim() || '#E0E0E0',
    modalBg: getCssVar('--modal-bg', '#fff').trim() || '#fff',
    noteBg: getCssVar('--note-bg', '#fff').trim() || '#fff',
    noteShadow: getCssVar('--note-shadow', '#ececec54').trim() || '#ececec54'
  };

  // PUBLIC_INTERFACE
  function handleOpenNewNote() {
    setEditNoteDraft({ title: '', content: '', tags: [] });
    setSelectedNote(null);
    setModalOpen(true);
    setCategoryInput('');
  }

  // PUBLIC_INTERFACE
  function handleEditNote(note) {
    setEditNoteDraft({ ...note });
    setSelectedNote(note);
    setModalOpen(true);
    setCategoryInput('');
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    if (!editNoteDraft.title.trim()) {
      alert('Title is required.');
      return;
    }
    const now = new Date();
    if (selectedNote) {
      // Edit existing
      setNotes(notes.map(n =>
        n.id === selectedNote.id
          ? { ...n, ...editNoteDraft, lastEdited: now }
          : n
      ));
    } else {
      // Create new
      setNotes([
        ...notes,
        {
          id: Date.now(),
          ...editNoteDraft,
          lastEdited: now
        }
      ]);
    }
    setModalOpen(false);
    setSelectedNote(null);
    setEditNoteDraft({ title: '', content: '', tags: [] });
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(noteId) {
    if (window.confirm('Delete this note?')) {
      setNotes(notes.filter(n => n.id !== noteId));
      // If deleting displayed note, close modal
      if (selectedNote && selectedNote.id === noteId) {
        setModalOpen(false);
        setSelectedNote(null);
      }
    }
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e) {
    setSearchValue(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleCategoryInput(e) {
    setCategoryInput(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleAddTag() {
    const tag = categoryInput.trim();
    if (tag &&
      !editNoteDraft.tags.includes(tag)
    ) {
      setEditNoteDraft({
        ...editNoteDraft,
        tags: [...(editNoteDraft.tags || []), tag]
      });
    }
    setCategoryInput('');
  }

  // PUBLIC_INTERFACE
  function handleRemoveTag(tag) {
    setEditNoteDraft({
      ...editNoteDraft,
      tags: editNoteDraft.tags.filter(t => t !== tag)
    });
  }

  // Filter notes per search value (title/content/tags)
  const filteredNotes = notes.filter(note => {
    if (!searchValue.trim()) return true;
    const val = searchValue.toLowerCase();
    return (
      note.title.toLowerCase().includes(val) ||
      note.content.toLowerCase().includes(val) ||
      (note.tags || []).some(t => t.toLowerCase().includes(val))
    );
  });

  // PUBLIC_INTERFACE
  function handleNoteDraftChange(field, value) {
    setEditNoteDraft({
      ...editNoteDraft,
      [field]: value
    });
  }

  // On search bar enter, focus first note
  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && filteredNotes.length > 0) {
      handleEditNote(filteredNotes[0]);
    }
  }

  // Simple content snippet (first 90 chars, break after newline)
  function snippet(content) {
    if (!content) return '';
    const s = content.split('\n')[0];
    return s.length > 90 ? s.slice(0, 87) + '...' : s;
  }

  // Tag chips used for notes and edit modal
  function TagsBar({ tags, onRemove }) {
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {(tags || []).map(tag => (
          <span
            key={tag}
            style={{
              background: getTagColor(tag) + '22',
              color: getTagColor(tag),
              borderRadius: '14px',
              fontSize: 12,
              padding: '1px 8px',
              marginBottom: 2,
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${getTagColor(tag)}`
            }}
          >
            {tag}
            {onRemove && (
              <button
                aria-label="Remove tag"
                onClick={() => onRemove(tag)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: getTagColor(tag),
                  marginLeft: 2,
                  fontSize: 13,
                  cursor: 'pointer',
                  lineHeight: '1'
                }}
              >×</button>
            )}
          </span>
        ))}
      </div>
    );
  }

  // --- Main Render
  return (
    <div style={{
      background: getCssVar('--base-dark', '#fff'),
      color: getCssVar('--text-color', '#181A1B'),
      minHeight: '100vh',
      position: 'relative',
      transition: 'background 0.2s'
    }}>
      {/* Header Bar */}
      <nav style={{
        width: '100%',
        background: COLORS.primary,
        color: COLORS.secondary,
        padding: '18px 0 16px 0',
        boxShadow: theme === "dark" ? '0 1px 4px #20243e' : '0 1px 4px #eaeaea',
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: 1,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: 880,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span role="img" aria-label="notes" style={{ marginRight: 8 }}>🗒️</span>
            <span>NoteEase</span>
          </div>
          <span style={{
            fontSize: 14, fontWeight: 400, color: COLORS.secondary, opacity: 0.85,
            display: 'flex', alignItems: 'center', gap: 18
          }}>
            <span>Simple Notes App</span>
            {/* ---- Theme Toggle Switch ---- */}
            <button
              aria-label="Toggle dark/light mode"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                marginLeft: 24,
                background: 'rgba(255,255,255,0.14)',
                border: "none",
                borderRadius: "1.2em",
                cursor: "pointer",
                display: 'flex',
                alignItems: 'center',
                padding: '5px 10px',
                fontSize: 16,
                color: COLORS.secondary,
                transition: "background 0.18s",
                outline: "none",
              }}
              onClick={toggleTheme}
            >
              <span style={{
                margin: "0 3px 0 2px",
                fontWeight: 700,
                filter: theme === "dark" ? "brightness(1.2)" : "none"
              }}>
                {theme === "dark" ? "🌙" : "☀️"}
              </span>
              <span style={{ fontSize: 13 }}>{theme === "dark" ? "Dark" : "Light"}</span>
            </button>
          </span>
        </div>
      </nav>

      {/* Search Bar */}
      <div style={{
        maxWidth: 880,
        margin: '24px auto 8px auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          ref={searchRef}
          type="text"
          aria-label="Search notes"
          placeholder="Search notes by title, content, or tag..."
          style={{
            flex: 1,
            padding: '11px 16px',
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 8,
            fontSize: 16,
            background: theme === "dark" ? "#222a33" : "#F8FAFD",
            color: COLORS.text,
            marginRight: 8,
            outline: 'none',
            boxShadow: 'none'
          }}
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      {/* Notes List */}
      <div style={{
        maxWidth: 880,
        margin: '0 auto',
        padding: '0 24px 90px 24px'
      }}>
        {filteredNotes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: getCssVar('--text-secondary', '#bbb'),
            marginTop: '48px',
            fontSize: 19
          }}>
            No notes yet. Click <b style={{ color: COLORS.primary }}>+</b> to get started!
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))',
              gap: '24px',
              paddingTop: 10
            }}
          >
            {filteredNotes.map(note => (
              <div
                key={note.id}
                tabIndex={0}
                aria-label={`View/Edit note ${note.title}`}
                style={{
                  background: COLORS.noteBg,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 14,
                  boxShadow: `0 1px 4px ${COLORS.noteShadow}`,
                  padding: '16px 16px 12px 16px',
                  transition: 'box-shadow 0.2s, background 0.2s',
                  cursor: 'pointer',
                  minHeight: 64,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  outline: 'none'
                }}
                onClick={() => handleEditNote(note)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleEditNote(note);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 1, color: COLORS.primary, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {note.title}
                  </div>
                  {/* Delete button */}
                  <button
                    aria-label="Delete note"
                    title="Delete note"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme === "dark" ? "#8793ad" : "#aaa",
                      cursor: 'pointer',
                      fontSize: 16, marginLeft: 8, padding: 0, position: 'relative', top: '-2px'
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                  >🗑️</button>
                </div>
                <div style={{
                  color: theme === "dark" ? "#e2e6f5" : "#555",
                  fontSize: 14,
                  marginBottom: 7,
                  minHeight: '22px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {snippet(note.content)}
                </div>
                {note.tags && note.tags.length > 0 && (
                  <TagsBar tags={note.tags} />
                )}
                <div style={{
                  color: theme === "dark" ? "#bac2ce" : "#b6b6b6",
                  fontStyle: 'italic',
                  fontSize: 11,
                  marginTop: '5px'
                }}>
                  {note.lastEdited ? 'Last edit: ' + (new Date(note.lastEdited)).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating New Note Button */}
      <button
        aria-label="Create new note"
        title="Create note"
        onClick={handleOpenNewNote}
        style={{
          background: COLORS.primary,
          color: COLORS.secondary,
          border: 'none',
          borderRadius: '50%',
          width: 60,
          height: 60,
          position: 'fixed',
          right: 38,
          bottom: 38,
          fontSize: 32,
          boxShadow: theme === "dark" ? '0 4px 18px #11193399' : '0 4px 18px #2233561c',
          cursor: 'pointer',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          transition: "background 0.2s"
        }}
      >+</button>

      {/* Modal for Note Creation/Edit */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: theme === "dark" ? '#121820c6' : '#00000032',
            zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
          onClick={() => { setModalOpen(false); setSelectedNote(null); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: COLORS.modalBg,
              color: COLORS.text,
              borderRadius: 18,
              padding: '32px 26px 20px 26px',
              minWidth: 340,
              width: '95vw',
              maxWidth: 430,
              boxShadow: theme === "dark" ? '0 6px 32px #111933cc' : '0 6px 32px #22335623'
            }}
          >
            <h2 style={{
              margin: 0,
              fontSize: 22,
              color: COLORS.primary,
              fontWeight: 700
            }}>
              {selectedNote ? 'Edit Note' : 'New Note'}
            </h2>
            <div style={{ margin: '18px 0 0 0', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <input
                type="text"
                aria-label="Note Title"
                placeholder="Title"
                value={editNoteDraft.title}
                maxLength={60}
                autoFocus
                onChange={e => handleNoteDraftChange('title', e.target.value)}
                style={{
                  padding: '10px 13px',
                  fontSize: 17,
                  borderRadius: 7,
                  border: `1.5px solid ${COLORS.border}`,
                  marginBottom: 5,
                  background: theme === "dark" ? "#202638" : "#fff",
                  color: COLORS.text
                }}
              />
              <textarea
                aria-label="Note Content"
                placeholder="Type your note here..."
                value={editNoteDraft.content}
                onChange={e => handleNoteDraftChange('content', e.target.value)}
                rows={6}
                style={{
                  resize: 'vertical',
                  padding: '10px 13px',
                  fontSize: 15,
                  borderRadius: 7,
                  border: `1.5px solid ${COLORS.border}`,
                  minHeight: 85,
                  background: theme === "dark" ? "#202638" : "#fff",
                  color: COLORS.text
                }}
              />
              {/* Categories/tags editing */}
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 13, color: theme === "dark" ? "#c5d7fa" : "#666", fontWeight: 500 }}>Categories/Tags:</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0 8px 0' }}>
                  <input
                    type="text"
                    aria-label="Add tag"
                    placeholder="Add tag..."
                    value={categoryInput}
                    maxLength={18}
                    onChange={handleCategoryInput}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                        e.preventDefault();
                      }
                    }}
                    style={{
                      padding: '7px',
                      fontSize: 13,
                      borderRadius: 7,
                      border: `1.2px solid ${COLORS.border}`,
                      width: 100,
                      background: theme === "dark" ? "#202638" : "#fff",
                      color: COLORS.text
                    }}
                  />
                  <button
                    aria-label="Add tag"
                    title="Add tag"
                    style={{
                      background: COLORS.accent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 5,
                      padding: '6px 13px',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                    onClick={handleAddTag}
                  >Add</button>
                  <TagsBar tags={editNoteDraft.tags || []} onRemove={handleRemoveTag} />
                </div>
              </div>
              {/* Modal actions */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 9
              }}>
                <button
                  onClick={() => { setModalOpen(false); setSelectedNote(null); }}
                  style={{
                    background: theme === "dark" ? "#23304c" : "#eee",
                    color: theme === "dark" ? "#e6eafd" : "#555",
                    border: 'none',
                    borderRadius: 5, padding: '9px 16px', fontSize: 15, fontWeight: 500
                  }}
                >Cancel</button>
                <button
                  onClick={handleSaveNote}
                  style={{
                    background: COLORS.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5, padding: '9px 20px', fontSize: 15, fontWeight: 500
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        width: '100%',
        textAlign: 'center',
        fontSize: 13,
        color: theme === "dark" ? "#5e6b80" : "#aaa",
        background: 'transparent',
        marginTop: 54,
        marginBottom: 8,
        userSelect: 'none'
      }}>
        © {new Date().getFullYear()} NoteEase
      </footer>
    </div>
  );
}

export default NoteEaseMain;
