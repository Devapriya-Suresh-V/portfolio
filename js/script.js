(() => {
  const $ = (s) => [...document.querySelectorAll(s)];

  /* Mobile menu */
  const nav = $('.nav')[0];
  $('.nav-toggle')[0].onclick = () => nav.classList.toggle('open');
  $('.nav a').forEach((a) => (a.onclick = () => nav.classList.remove('open')));
  $('#yr')[0].textContent = new Date().getFullYear();

  /* Image slots: each .slot reads its file from data-img.
     If the file is missing it shows an "Add image" placeholder you can click to preview a photo.
     Add ?edit to the page URL to make every slot clickable. */
  const edit = new URLSearchParams(location.search).has('edit');
  if (edit) document.body.classList.add('edit');
  const key = (s) => 'dsv-img:' + s.dataset.img;
  const picker = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' });
  let current = null;

  function fill(slot, src) {
    slot.innerHTML = '';
    const img = new Image();
    img.src = src;
    img.alt = slot.dataset.alt || '';
    slot.append(img);
    slot.classList.remove('empty');
    slot.classList.add('filled');
  }
  function blank(slot) {
    slot.classList.remove('filled');
    slot.classList.add('empty');
    slot.innerHTML = '<span class="ph"><b>+ Add image</b><small>' + slot.dataset.img + '</small></span>';
  }

  $('.slot').forEach((slot) => {
    slot.onclick = () => {
      if (slot.classList.contains('empty') || edit) { current = slot; picker.click(); }
    };
    let saved = null;
    try { saved = localStorage.getItem(key(slot)); } catch (e) {}
    if (saved) return fill(slot, saved);
    const probe = new Image();
    probe.onload = () => fill(slot, slot.dataset.img);
    probe.onerror = () => blank(slot);
    probe.src = slot.dataset.img;
  });

  picker.onchange = () => {
    const file = picker.files[0];
    if (!file || !current) return;
    const slot = current;
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 1400 / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = im.width * k; c.height = im.height * k;
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        const data = c.toDataURL('image/jpeg', 0.82);
        fill(slot, data);
        try { localStorage.setItem(key(slot), data); } catch (e) {}
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
    picker.value = '';
  };

  if (edit) {
    const bar = document.createElement('div');
    bar.className = 'edit-bar';
    bar.innerHTML = 'Edit mode: click any image to replace it <button>Clear previews</button>';
    bar.querySelector('button').onclick = () => {
      $('.slot').forEach((s) => { try { localStorage.removeItem(key(s)); } catch (e) {} });
      location.reload();
    };
    document.body.append(bar);
  }
})();
