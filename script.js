// === ESTADO GLOBAL ===
    const STORAGE_KEY = 'homeInventory_v1';
    let state = { inventory: [], shoppingList: [] };

    // === UTILITÁRIOS ===
    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    const genId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const loadState = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) try { state = JSON.parse(raw); } catch { state = { inventory: [], shoppingList: [] }; }
      renderAll();
    };

    // === RENDERIZAÇÃO ===
    function renderAll() {
      renderInventory();
      renderShoppingList();
      renderShopSelect();
      document.getElementById('debug-preview').textContent = JSON.stringify(state, null, 2);
    }

    function renderInventory() {
      const tbody = document.getElementById('inv-tbody');
      tbody.innerHTML = '';
      document.getElementById('inv-empty').style.display = state.inventory.length ? 'none' : 'block';

      state.inventory.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'item-row';
        tr.innerHTML = `
          <td class="fw-medium">${item.name}</td>
          <td><input type="number" class="form-control form-control-sm p-1 inv-qty-input" data-id="${item.id}" value="${item.qty}" min="0" step="any" style="width:60px"></td>
          <td><input type="number" class="form-control form-control-sm p-1 inv-price-input" data-id="${item.id}" value="${item.price}" min="0" step="0.01" style="width:80px"></td>
          <td class="text-end"><button class="btn btn-sm btn-outline-danger btn-del-inv" data-id="${item.id}">×</button></td>
        `;
        tbody.appendChild(tr);
      });
    }

    function renderShoppingList() {
      const container = document.getElementById('shop-list');
      container.innerHTML = '';
      document.getElementById('shop-empty').style.display = state.shoppingList.length ? 'none' : 'block';

      let total = 0;
      state.shoppingList.forEach(item => {
        total += (item.qty || 0) * (item.price || 0);
        const div = document.createElement('div');
        div.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-1 rounded';
        div.innerHTML = `
          <div class="flex-grow-1">
            <div class="fw-medium">${item.name}</div>
            <div class="small text-muted">Qtd: ${item.qty} | Preço: ${formatBRL(item.price)}</div>
          </div>
          <div class="d-flex align-items-center gap-1">
            <input type="number" class="form-control form-control-sm shop-qty-input" data-id="${item.id}" value="${item.qty}" min="1" step="any" style="width:60px">
            <input type="number" class="form-control form-control-sm shop-price-input" data-id="${item.id}" value="${item.price}" min="0" step="0.01" style="width:80px">
            <button class="btn btn-sm btn-outline-danger btn-del-shop" data-id="${item.id}">×</button>
          </div>
        `;
        container.appendChild(div);
      });
      document.getElementById('shop-total').textContent = formatBRL(total);
    }

    function renderShopSelect() {
      const sel = document.getElementById('shop-select');
      sel.innerHTML = '<option value="">Selecione do estoque...</option>';
      state.inventory.forEach(i => {
        sel.innerHTML += `<option value="${i.id}">${i.name}</option>`;
      });
    }

    // === EVENTOS: ESTOQUE ===
    document.getElementById('inv-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('inv-name').value.trim();
      const qty = parseFloat(document.getElementById('inv-qty').value) || 0;
      const price = parseFloat(document.getElementById('inv-price').value) || 0;
      if (!name) return;

      const existing = state.inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.qty += qty;
        existing.price = price;
      } else {
        state.inventory.push({ id: genId(), name, qty, price });
      }
      saveState(); renderAll(); e.target.reset();
    });

    document.getElementById('inv-table').addEventListener('change', e => {
      const input = e.target;
      if (!input.dataset.id) return;
      const item = state.inventory.find(i => i.id === input.dataset.id);
      if (!item) return;
      if (input.classList.contains('inv-qty-input')) item.qty = parseFloat(input.value) || 0;
      if (input.classList.contains('inv-price-input')) item.price = parseFloat(input.value) || 0;
      saveState();
    });

    document.getElementById('inv-table').addEventListener('click', e => {
      const btn = e.target.closest('.btn-del-inv');
      if (!btn) return;
      state.inventory = state.inventory.filter(i => i.id !== btn.dataset.id);
      saveState(); renderAll();
    });

    // === EVENTOS: LISTA DE COMPRAS ===
    document.getElementById('add-from-inv-btn').addEventListener('click', () => {
      const sel = document.getElementById('shop-select').value;
      if (!sel) return;
      const invItem = state.inventory.find(i => i.id === sel);
      if (!invItem) return;

      const exists = state.shoppingList.find(i => i.invId === invItem.id);
      if (exists) { exists.qty += 1; }
      else { state.shoppingList.push({ id: genId(), invId: invItem.id, name: invItem.name, qty: 1, price: invItem.price }); }
      saveState(); renderAll();
      document.getElementById('shop-select').value = '';
    });

    document.getElementById('shop-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('shop-name').value.trim();
      const qty = parseFloat(document.getElementById('shop-qty').value) || 1;
      const price = parseFloat(document.getElementById('shop-price').value) || 0;
      if (!name) return;

      state.shoppingList.push({ id: genId(), invId: null, name, qty, price });
      saveState(); renderAll(); e.target.reset();
    });

    document.getElementById('shop-list').addEventListener('change', e => {
      const input = e.target;
      if (!input.dataset.id) return;
      const item = state.shoppingList.find(i => i.id === input.dataset.id);
      if (!item) return;
      if (input.classList.contains('shop-qty-input')) item.qty = parseFloat(input.value) || 1;
      if (input.classList.contains('shop-price-input')) item.price = parseFloat(input.value) || 0;
      saveState(); renderShoppingList(); // Re-render to update total only
    });

    document.getElementById('shop-list').addEventListener('click', e => {
      const btn = e.target.closest('.btn-del-shop');
      if (!btn) return;
      state.shoppingList = state.shoppingList.filter(i => i.id !== btn.dataset.id);
      saveState(); renderAll();
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
      if (!state.shoppingList.length) return alert('Lista vazia!');
      if (!confirm('Finalizar compra? Os itens serão atualizados no estoque.')) return;

      state.shoppingList.forEach(shopItem => {
        if (shopItem.invId) {
          const invItem = state.inventory.find(i => i.id === shopItem.invId);
          if (invItem) { invItem.qty += shopItem.qty; invItem.price = shopItem.price; }
        } else {
          state.inventory.push({ id: genId(), name: shopItem.name, qty: shopItem.qty, price: shopItem.price });
        }
      });
      state.shoppingList = [];
      saveState(); renderAll();
    });

    document.getElementById('clear-shop-btn').addEventListener('click', () => {
      if (confirm('Limpar lista atual?')) { state.shoppingList = []; saveState(); renderAll(); }
    });

    // === IMPORTAR / EXPORTAR ===
    document.getElementById('export-btn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `estoque_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
    });

    document.getElementById('import-btn').addEventListener('click', () => {
      const file = document.getElementById('import-file').files[0];
      if (!file) return alert('Selecione um arquivo .json');
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          if (!Array.isArray(data.inventory) || !Array.isArray(data.shoppingList)) throw new Error('Estrutura inválida');
          if (confirm('Isso substituirá todos os dados atuais. Continuar?')) {
            state = data; saveState(); renderAll(); alert('Dados importados com sucesso!');
          }
        } catch (err) { alert('Erro ao importar: ' + err.message); }
      };
      reader.readAsText(file);
    });

    // === NAVEGAÇÃO POR ABAS ===
    document.querySelectorAll('#mainTabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#mainTabs button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });

    // === INICIALIZAÇÃO ===
    loadState();