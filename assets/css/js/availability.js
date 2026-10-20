// Filter the prototype timetable using the controls above it.
(function () {
  const table = document.getElementById('timetable');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  const filters = document.getElementById('filters');
  const stamp = document.getElementById('last-updated');
  if (!filters) return;

  const rows = Array.from(tbody.rows);
  const dateFilter = filters.elements.date;
  const typeFilter = filters.elements.type;
  const trainerFilter = filters.elements.trainer;

  function filterRows() {
    const date = dateFilter.value;
    const type = typeFilter.value.toLowerCase();
    const trainer = trainerFilter.selectedOptions[0].text.toLowerCase();
    let visible = 0;

    rows.forEach(row => {
      const matches = (!date || row.cells[0].textContent.trim() === date)
        && (!type || row.cells[3].textContent.trim().toLowerCase() === type)
        && (!trainerFilter.value || row.cells[4].textContent.trim().toLowerCase() === trainer);
      row.hidden = !matches;
      if (matches) visible += 1;
    });

    if (stamp) stamp.textContent = `Showing ${visible} of ${rows.length} scheduled classes.`;
  }

  filters.addEventListener('change', filterRows);
  filterRows();
})();
