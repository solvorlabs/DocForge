// src/components/TagDropdown.js
import React, { useRef, useState, useEffect } from 'react';

function TagDropdown({ availableTags, selectedTags, setSelectedTags }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filteredTags = availableTags.filter(tag =>
    !search || tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: 400 }}>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, minHeight: 38, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 6, background: '#fff', padding: 4 }}
        onClick={() => setOpen(true)}
      >
        {selectedTags.length === 0 && <span style={{ color: '#888' }}>Select topics...</span>}
        {selectedTags.map(tag => (
          <span key={tag} className="doodle-badge" style={{ background: 'var(--doodle-blue)' }}>
            {tag}
            <button
              style={{
                marginLeft: 4,
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={e => {
                e.stopPropagation();
                setSelectedTags(selectedTags.filter(t => t !== tag));
              }}
              title="Remove"
              type="button"
            >×</button>
          </span>
        ))}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search topics..."
          style={{ border: 'none', outline: 'none', flex: 1, minWidth: 80, background: 'transparent', fontSize: '1rem' }}
        />
      </div>
      {open && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 6,
          maxHeight: 180,
          overflowY: 'auto',
          background: '#fff',
          position: 'absolute',
          width: '100%',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {filteredTags.length === 0 && (
            <div style={{ padding: '8px 12px', color: '#888' }}>No topics found</div>
          )}
          {filteredTags.map(tag => (
            <div
              key={tag}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: selectedTags.includes(tag) ? 'var(--doodle-blue)' : 'transparent',
                color: selectedTags.includes(tag) ? '#fff' : '#222'
              }}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter(t => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
            >
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                readOnly
                style={{ marginRight: 8 }}
              />
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TagDropdown;