'use strict';
(() => {
  const products = Object.freeze({
    standard: { name: '6040 А · с поворотной осью', price: 289000 },
    tooling: { name: '6040 А · с набором оснастки', price: 314000 }
  });
  const money = value => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  const storageKey = 'osnova-cart-v1';
  let cart = {};
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      for (const id of Object.keys(products)) {
        if (Number.isInteger(saved[id]) && saved[id] > 0 && saved[id] <= 99) cart[id] = saved[id];
      }
    }
  } catch { /* A private browser or file URL can disable storage. The cart still works in memory. */ }
  function saveCart() { try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch {} }
  const cartDialog = document.getElementById('cart-dialog');
  function renderCart(focusTarget) {
    const container = document.getElementById('cart-items');
    container.replaceChildren();
    let count = 0; let total = 0;
    for (const [id, quantity] of Object.entries(cart)) {
      const product = products[id]; count += quantity; total += quantity * product.price;
      const row = document.createElement('article'); row.className = 'cart-row';
      // IDs and product strings come only from the fixed catalogue above.
      row.innerHTML = `<img src="assets/machine.svg" width="85" height="85" alt="Схема станка ОСНОВА 6040 А"><div><h3>${product.name}</h3><p>${money(product.price)} за шт.</p><div class="quantity"><button data-action="decrease" data-id="${id}" aria-label="Уменьшить количество: ${product.name}">−</button><output aria-label="Количество">${quantity}</output><button data-action="increase" data-id="${id}" aria-label="Увеличить количество: ${product.name}" ${quantity >= 99 ? 'disabled' : ''}>+</button><button class="remove" data-action="remove" data-id="${id}">Удалить</button></div></div>`;
      container.append(row);
    }
    if (!count) { const empty = document.createElement('p'); empty.className = 'empty-cart'; empty.textContent = 'Здесь пока пусто. Выберите комплектацию станка и добавьте её в корзину.'; container.append(empty); }
    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-total').textContent = money(total);
    document.getElementById('cart-summary').hidden = count === 0;
    document.getElementById('export-status').textContent = 'Файл можно передать поставщику для расчёта.';
    if (focusTarget) {
      const next = container.querySelector(`[data-id="${focusTarget.id}"][data-action="${focusTarget.action}"]:not(:disabled)`)
        || container.querySelector('button:not(:disabled)') || cartDialog.querySelector('[data-close]');
      next.focus();
    }
  }
  document.querySelectorAll('[name="variant"]').forEach(input => input.addEventListener('change', () => {
    document.getElementById('product-price').textContent = money(products[input.value].price);
    document.getElementById('add-status').textContent = 'Демо-магазин: корзина работает, оплата не подключена.';
  }));
  document.getElementById('add-cart').addEventListener('click', () => {
    const id = document.querySelector('[name="variant"]:checked').value;
    if ((cart[id] || 0) >= 99) { document.getElementById('add-status').textContent = 'В корзине уже 99 единиц этой комплектации.'; return; }
    cart[id] = (cart[id] || 0) + 1; saveCart(); renderCart();
    document.getElementById('add-status').textContent = `${products[id].name} добавлен в корзину.`;
    cartDialog.showModal();
  });
  document.getElementById('open-cart').addEventListener('click', () => cartDialog.showModal());
  document.getElementById('cart-items').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const { id, action } = button.dataset; if (!Object.hasOwn(products, id) || !cart[id]) return;
    if (action === 'remove') delete cart[id];
    else if (action === 'decrease') { cart[id]--; if (!cart[id]) delete cart[id]; }
    else if (action === 'increase') cart[id] = Math.min(99, cart[id] + 1);
    saveCart(); renderCart({ id, action });
  });
  const parts = {
    spindle: { number: '01', image: 'spindle', alt: 'Условная схема шпинделя и каретки станка крупным планом', caption: '01 / Шпиндель и каретка · схема', measure: 'Пример конфигурации / 1,5 кВт · ER11', title: 'Шпиндель и крепление фрезы', description: 'В образце конфигурации — шпиндель 1,5 кВт с жидкостным охлаждением и цангой ER11. Диаметр хвостовика подбирают под конкретную цангу; маркировка ER11 сама по себе не означает, что в комплекте есть все размеры.', use: 'Перед заказом: уточните диапазон оборотов, биение и состав системы охлаждения.' },
    rotary: { number: '02', image: 'rotary', alt: 'Условная схема поворотного патрона, заготовки и задней бабки', caption: '02 / Поворотный узел · схема', measure: 'Пример конфигурации / патрон Ø 80 мм', title: 'Поворотный узел с патроном', description: 'Трёхкулачковый патрон удерживает заготовку, задняя бабка поддерживает её с другого конца. В образце указан патрон диаметром 80 мм. Это размер патрона, а не максимальный диаметр детали.', use: 'Перед заказом: уточните высоту центров, расстояние между центрами и режим работы четвёртой оси.' },
    bed: { number: '03', image: 'bed', alt: 'Условная схема алюминиевого стола с параллельными Т-пазами для крепления заготовки', caption: '03 / Рабочий стол · схема', measure: 'Пример конфигурации / поле 600 × 400 мм', title: 'Рабочий стол и крепление заготовки', description: 'Алюминиевый стол с Т-пазами позволяет разместить прижимы и оснастку по форме заготовки. В образце рабочее поле по X и Y составляет 600 × 400 мм. Прижимы и поворотный узел занимают часть этой площади.', use: 'Перед заказом: проверьте размер пазов, допустимую нагрузку и схему крепления вашей оснастки.' }
  };
  document.querySelectorAll('[data-part]').forEach(button => button.addEventListener('click', () => {
    const part = parts[button.dataset.part];
    document.querySelectorAll('[data-part]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const image = document.getElementById('part-image'); image.src = `assets/${part.image}.svg`; image.alt = part.alt;
    for (const [suffix, value] of Object.entries({ number: part.number, caption: part.caption, measure: part.measure, title: part.title, description: part.description, use: part.use })) document.getElementById(`part-${suffix}`).textContent = value;
  }));
  function downloadText(filename, text) {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  document.getElementById('export-cart').addEventListener('click', () => {
    let total = 0;
    const lines = Object.entries(cart).map(([id, quantity]) => { const product = products[id]; total += product.price * quantity; return `${product.name}\n${quantity} шт. × ${money(product.price)} = ${money(quantity * product.price)}`; });
    if (!lines.length) return;
    downloadText('ОСНОВА-состав-заказа.txt', `ОСНОВА — демонстрационный состав заказа\nНе счёт на оплату. Цены, параметры и наличие требуют подтверждения.\n\n${lines.join('\n\n')}\n\nИтого: ${money(total)}, без доставки.\n\nПросьба подтвердить конфигурацию, срок поставки и условия гарантии.`);
    document.getElementById('export-status').textContent = 'Файл состава заказа подготовлен к скачиванию.';
  });
  document.getElementById('download-specs').addEventListener('click', () => {
    const rows = [...document.querySelectorAll('#specs tbody tr')].map(row => [...row.cells].map(cell => cell.innerText.trim()).join(': '));
    downloadText('ОСНОВА-пример-спецификации.txt', 'ОСНОВА 6040 А\nДЕМОНСТРАЦИОННЫЕ ДАННЫЕ. Не паспорт серийного станка.\n\n' + rows.join('\n\n'));
  });
  const policies = {
    terms: { title: 'Условия заказа', text: 'Это демонстрационный магазин. Добавление в корзину и скачивание файла не оформляют покупку и не резервируют оборудование. Цены, характеристики, сроки доставки, возврат и гарантию необходимо согласовать с реальным поставщиком до оплаты. Приём платежей на сайте не подключён.' },
    privacy: { title: 'Конфиденциальность', text: 'Корзина сохраняется в локальном хранилище вашего браузера, если оно доступно. Сайт не отправляет состав заказа на сервер и не запрашивает персональные данные. Чтобы очистить корзину, удалите из неё товары или очистите данные сайта в браузере. Используются установленные на вашем устройстве шрифты. Внешние сервисы шрифтов не подключены.' }
  };
  document.querySelectorAll('[data-policy]').forEach(button => button.addEventListener('click', () => {
    const policy = policies[button.dataset.policy]; document.getElementById('policy-title').textContent = policy.title; document.getElementById('policy-content').textContent = policy.text; document.getElementById('policy-dialog').showModal();
  }));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return; const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  }));
  renderCart();
})();
