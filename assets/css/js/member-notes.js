(function () {
  const memberSelect = document.getElementById('member_id');
  const form = document.getElementById('note-form');
  const noteInput = document.getElementById('note');
  const notesList = document.getElementById('notes-list');
  const status = document.getElementById('note-status');

  if (!memberSelect || !form || !noteInput || !notesList || !status) return;

  const requestedMember = new URLSearchParams(window.location.search).get('member_id');
  if (requestedMember && Array.from(memberSelect.options).some(option => option.value === requestedMember)) {
    memberSelect.value = requestedMember;
  }

  function storageKey() {
    return `gymflow-member-notes-${memberSelect.value}`;
  }

  function initialNotes() {
    return Array.from(notesList.querySelectorAll('[data-note]')).map(item => ({
      createdAt: item.dataset.createdAt,
      text: item.dataset.text
    }));
  }

  const defaultNotes = initialNotes();

  function render(notes) {
    notesList.replaceChildren();
    notes.forEach(note => {
      const paragraph = document.createElement('p');
      const timestamp = document.createElement('small');
      timestamp.textContent = new Date(note.createdAt).toLocaleString();
      paragraph.append(timestamp, document.createElement('br'), document.createTextNode(note.text));
      notesList.append(paragraph);
    });
  }

  function loadNotes() {
    try {
      const savedNotes = localStorage.getItem(storageKey());
      render(savedNotes === null ? defaultNotes : JSON.parse(savedNotes));
    } catch (error) {
      console.error('Unable to load member notes.', error);
      status.textContent = 'Notes could not be loaded from this browser.';
    }
  }

  memberSelect.addEventListener('change', loadNotes);
  loadNotes();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = noteInput.value.trim();
    if (!text) {
      noteInput.focus();
      return;
    }

    try {
      const savedNotes = localStorage.getItem(storageKey());
      const notes = savedNotes === null ? defaultNotes.slice() : JSON.parse(savedNotes);
      notes.unshift({ createdAt: new Date().toISOString(), text });
      localStorage.setItem(storageKey(), JSON.stringify(notes));
      render(notes);
      form.reset();
      status.textContent = 'Note saved in this browser.';
    } catch (error) {
      console.error('Unable to save member note.', error);
      status.textContent = 'Note could not be saved in this browser.';
    }
  });
})();
