// FR-AV-03: refresh the timetable every 30 s without reloading the page.
(function () {
  const table = document.getElementById('timetable');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  const isMember = table.dataset.member === '1';
  const API = table.dataset.api || '/api/availability.php';
  const INTERVAL = 30000;
  let timer = null, busy = false, lastEtag = null;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cls = s => 'status-' + s.toLowerCase().replace(' ', '-');

  function render(classes) {
    if (!classes.length) {
      tbody.innerHTML = '<tr><td colspan="9">No classes found.</td></tr>';
      return;
    }
    tbody.innerHTML = classes.map(c => {
      const canBook = isMember && (c.status === 'Available' || c.status === 'Almost full');
      const action = isMember
        ? (canBook ? `<a class="btn" href="book.html?class_id=${c.id}">Book</a>` : '')
        : '';
      return `<tr data-id="${c.id}">
        <td>${esc(c.date)}</td><td>${esc(c.start)}-${esc(c.end)}</td>
        <td><a href="${isMember ? 'class_details.html' : 'schedule.html'}?id=${c.id}">${esc(c.name)}</a></td>
        <td>${esc(c.type)}</td><td>${esc(c.trainer)}</td>
        <td>${c.booked}/${c.capacity}</td><td>${c.spots_left}</td>
        <td><span class="badge ${cls(c.status)}">${esc(c.status)}</span></td>
        <td>${action}</td></tr>`;
    }).join('');
  }

  async function refresh() {
    if (busy || document.hidden) return;          // don't pile up requests / skip hidden tabs
    busy = true;
    try {
      const params = new URLSearchParams(new FormData(document.getElementById('filters') || undefined));
      const headers = lastEtag ? { 'If-None-Match': lastEtag } : {};
      const res = await fetch(API + '?' + params.toString(), { headers, cache: 'no-cache' });
      if (res.status === 304) return;             // unchanged
      if (!res.ok) throw new Error('HTTP ' + res.status);
      lastEtag = res.headers.get('ETag');
      render((await res.json()).classes);
      const stamp = document.getElementById('last-updated');
      if (stamp) stamp.textContent = 'Updated ' + new Date().toLocaleTimeString();
    } catch (e) {
      console.warn('Availability refresh failed', e);   // keep old data on screen
    } finally { busy = false; }
  }

  function start() { stop(); timer = setInterval(refresh, INTERVAL); }
  function stop() { if (timer) clearInterval(timer); }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) { refresh(); } });
  const f = document.getElementById('filters');
  if (f) f.addEventListener('change', () => { lastEtag = null; refresh(); });
  refresh(); start();
})();
