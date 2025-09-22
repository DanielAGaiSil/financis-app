/* assets/jsfront.js — versão sugerida (substituir o arquivo atual) */

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    /* -------------- Navegação entre páginas -------------- */
    const navButtons = document.querySelectorAll('.nav-button');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach(button => {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        const targetPageId = this.getAttribute('data-page');

        navButtons.forEach(btn => {
          btn.classList.remove('text-[#4ade80]');
          btn.classList.add('text-gray-400');
        });

        this.classList.remove('text-gray-400');
        this.classList.add('text-[#4ade80]');

        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) targetPage.classList.add('active');

        window.scrollTo(0, 0);
      });
    });

    /* -------------------- GRÁFICO DE DESPESAS -------------------- */
    let despesasChart = null;
    let chartType = "bar";

    function renderDespesasChart() {
      const ctx = document.getElementById("despesasChart")?.getContext("2d");
      if (!ctx) return;

      const transactions = getTransactions();
      const categorias = {};
      transactions.forEach(tx => {
        if (tx.type === "despesa") {
          categorias[tx.categoryLabel || tx.category] =
            (categorias[tx.categoryLabel || tx.category] || 0) + tx.amount;
        }
      });

      const labels = Object.keys(categorias);
      const data = Object.values(categorias);

      if (despesasChart) despesasChart.destroy();

      despesasChart = new Chart(ctx, {
        type: chartType,
        data: {
          labels,
          datasets: [{
            label: "Despesas",
            data,
            backgroundColor: ["#4ade80", "#2563eb", "#f97316", "#f43f5e", "#8b5cf6"]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: chartType === "pie", labels: { color: "#fff" } }
          },
          scales: chartType === "bar" ? {
            x: { ticks: { color: "#ccc" }, grid: { color: "#333" } },
            y: { ticks: { color: "#ccc" }, grid: { color: "#333" } }
          } : {}
        }
      });
    }

    /*-------------------- GRÁFICO DO RELATÓRIO --------------------*/
    let relatorioChart = null;
    let periodoSelecionado = "Mensal";

    function renderRelatorioChart(periodo = periodoSelecionado) {
      const ctx = document.getElementById("relatorioChart")?.getContext("2d");
      if (!ctx) return;

      const transactions = getTransactions();
      const labels = [];
      const data = [];
      const hoje = new Date();

      if (periodo === "Semanal") {
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(hoje.getDate() - i);
          const dia = d.toLocaleDateString("pt-BR", { weekday: "short" });
          labels.push(dia);
          const saldoDia = transactions
            .filter(tx => new Date(tx.date).toDateString() === d.toDateString())
            .reduce((acc, tx) => acc + (tx.type === "despesa" ? -tx.amount : tx.amount), 0);
          data.push(saldoDia);
        }
      }
      if (periodo === "Mensal") {
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(hoje.getMonth() - i);
          const mes = d.toLocaleDateString("pt-BR", { month: "short" });
          labels.push(mes);
          const saldoMes = transactions
            .filter(tx => {
              const dt = new Date(tx.date);
              return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
            })
            .reduce((acc, tx) => acc + (tx.type === "despesa" ? -tx.amount : tx.amount), 0);
          data.push(saldoMes);
        }
      }
      if (periodo === "Anual") {
        for (let i = 4; i >= 0; i--) {
          const ano = hoje.getFullYear() - i;
          labels.push(ano);
          const saldoAno = transactions
            .filter(tx => new Date(tx.date).getFullYear() === ano)
            .reduce((acc, tx) => acc + (tx.type === "despesa" ? -tx.amount : tx.amount), 0);
          data.push(saldoAno);
        }
      }

      if (relatorioChart) relatorioChart.destroy();
      relatorioChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Saldo",
            data,
            borderColor: "rgb(34,197,94)",
            backgroundColor: "rgba(34,197,94,0.2)",
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: "#96c5a9" }, grid: { color: "#264532" } },
            y: { ticks: { color: "#96c5a9" }, grid: { color: "#264532" } }
          }
        }
      });

      const total = data.reduce((a, b) => a + b, 0);
      const totalEl = document.getElementById("relatorio_total");
      if (totalEl) totalEl.textContent =
        "R$ " + total.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    }

    function renderTopExpenses() {
      const container = document.getElementById("top_expenses");
      if (!container) return;
      const transactions = getTransactions();
      const gastosPorCategoria = {};
      transactions.forEach(tx => {
        if (tx.type === "despesa") {
          gastosPorCategoria[tx.categoryLabel || tx.category] =
            (gastosPorCategoria[tx.categoryLabel || tx.category] || 0) + tx.amount;
        }
      });
      const top = Object.entries(gastosPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      container.innerHTML = top.map(([categoria, valor]) => `
        <div class="flex items-center gap-4 rounded-xl p-2 hover:bg-white/5 transition-colors">
          <div class="text-white flex items-center justify-center rounded-full bg-[#264532] shrink-0 size-12">
            <span class="material-symbols-outlined">category</span>
          </div>
          <div class="flex-grow">
            <p class="text-white text-base font-medium">${categoria}</p>
            <p class="text-[#96c5a9] text-sm">R$ ${valor.toFixed(2)}</p>
          </div>
          <p class="text-white font-bold text-lg">R$ ${valor.toFixed(2)}</p>
        </div>`).join("");
    }

    /* -------------------- Inicialização global -------------------- */
    renderDespesasChart();
    renderRelatorioChart("Mensal");
    renderTopExpenses();

    const toggleBtn = document.getElementById("toggleChartType");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        chartType = chartType === "bar" ? "pie" : "bar";
        renderDespesasChart();
      });
    }
    document.querySelectorAll("input[name='period']").forEach(radio => {
      radio.addEventListener("change", e => {
        periodoSelecionado = e.target.value;
        renderRelatorioChart(periodoSelecionado);
        renderTopExpenses();
      });
    });

    /* -------------------- ORÇAMENTOS -------------------- */
    // Lê orçamentos salvos
    function getBudgets() {
      try {
        return JSON.parse(localStorage.getItem("budgets")) || [];
      } catch (err) {
        console.error("Erro lendo budgets do localStorage", err);
        return [];
      }
    }

    // Salva orçamentos
    function saveBudgets(list) {
      localStorage.setItem("budgets", JSON.stringify(list));
    }

    // Renderiza a lista de orçamentos na aba
    function renderBudgets() {
    const container = document.getElementById("budgetsList");
    if (!container) return;

    const budgets = getBudgets();
    const transactions = getTransactions();

    container.innerHTML = "";

    if (budgets.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-400 py-6">Nenhum orçamento definido.</p>`;
      return;
    }

    budgets.forEach(budget => {
      // Soma despesas da categoria
      const gastos = transactions
        .filter(tx => tx.type === "despesa" && tx.category === budget.category)
        .reduce((acc, tx) => acc + Number(tx.amount), 0);

      const limite = Number(budget.limit);
      const progress = limite > 0 ? Math.min(100, Math.round((gastos / limite) * 100)) : 0;

      // Cor dinâmica para barra
      let barColor = "bg-green-500";
      if (progress > 90) barColor = "bg-red-500";
      else if (progress > 60) barColor = "bg-yellow-500";

      const valueColor = gastos > limite ? "text-red-500" : "text-[--text-primary]";

      const div = document.createElement("div");
      div.className = "rounded-xl bg-[--bg-secondary] p-4";

      div.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[--primary-900]">
            <span class="material-symbols-outlined text-[--primary-300] text-3xl">account_balance_wallet</span>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <p class="text-base font-medium text-[--text-primary]">${budget.categoryLabel}</p>
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium ${valueColor}">
                  R$ ${gastos.toFixed(2)} / 
                  <span class="text-[--text-secondary]">R$ ${limite.toFixed(2)}</span>
                </p>
                <button class="edit-budget p-1 rounded-md hover:bg-white/5" data-category="${budget.category}">
                  <span class="material-symbols-outlined text-zinc-400">edit</span>
                </button>
                <button class="delete-budget p-1 rounded-md hover:bg-white/5" data-category="${budget.category}">
                  <span class="material-symbols-outlined text-zinc-400">delete</span>
                </button>
              </div>
            </div>
            <div class="mt-2 w-full overflow-hidden rounded-full bg-[--border-primary]">
              <div class="h-2 rounded-full ${barColor}" style="width:${progress}%"></div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  }

    // Modal de adicionar orçamento
    function toggleAddBudget() {
      const modal = document.getElementById("addBudgetForm");
      modal && modal.classList.toggle("hidden");
    }
    window.toggleAddBudget = toggleAddBudget;

    // Submit do formulário de orçamento
    const budgetForm = document.getElementById("budgetForm");
    if (budgetForm) {
      budgetForm.addEventListener("submit", e => {
        e.preventDefault();

        const categorySelect = document.getElementById("budgetCategory");
        const category = categorySelect.value;
        const categoryLabel = categorySelect.options[categorySelect.selectedIndex].text;

        const limit = parseFloat(document.getElementById("budgetLimit").value);

        if (!limit || limit <= 0) {
          alert("Informe um valor válido para o limite.");
          return;
        }

        let budgets = getBudgets();

        // se já existir orçamento dessa categoria → substitui
        const existingIndex = budgets.findIndex(b => b.category === category);
        if (existingIndex >= 0) {
          budgets[existingIndex].limit = limit;
        } else {
          budgets.push({ category, categoryLabel, limit });
        }

        saveBudgets(budgets);
        renderBudgets();

        budgetForm.reset();
        document.getElementById("addBudgetForm").classList.add("hidden");
      });

      // Delegação para editar orçamento
      document.addEventListener("click", e => {
        const editBtn = e.target.closest(".edit-budget");
        if (!editBtn) return;
        
        const category = editBtn.dataset.category;
        const budgets = getBudgets();
        const budget = budgets.find(b => b.category === category);
        if (!budget) return;


        // Preenche o modal com os dados do orçamento
        const categorySelect = document.getElementById("budgetCategory");
        categorySelect.value = budget.category;

        document.getElementById("budgetLimit").value = budget.limit;

        // Abre o modal
        document.getElementById("addBudgetForm").classList.remove("hidden");
      });

      // Delegação para deletar orçamento
      document.addEventListener("click", e => {
        const delBtn = e.target.closest(".delete-budget");
        if (!delBtn) return;

        const category = delBtn.dataset.category;
        if (!category) return;

        if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;

        let budgets = getBudgets().filter(b => b.category !== category);
        saveBudgets(budgets);
        renderBudgets();
      });
    }


    /* -------------- Modal de adicionar transação -------------- */
    const modal = document.getElementById("addTransactionForm");
    function toggleAddTransaction() {
      if (!modal) return;
      modal.classList.toggle("hidden");
    }
    window.toggleAddTransaction = toggleAddTransaction; // expõe para o HTML inline

    /* -------------- Elementos do formulário / UI -------------- */
    const form = document.getElementById("transactionForm");
    const transactionsList = document.getElementById("transactionsList");

    const expenseBtn = document.getElementById("expenseBtn");
    const incomeBtn = document.getElementById("incomeBtn");
    const expenseCategories = document.getElementById("expenseCategories");
    const incomeCategories = document.getElementById("incomeCategories");
    const amountInput = document.getElementById("amount");

    let isExpense = true;
    let editingTransactionId = null;

    function setExpenseMode(expense) {
      isExpense = expense;

      if (expense) {
        expenseBtn.classList.add("bg-red-600", "text-white");
        expenseBtn.classList.remove("text-gray-400");

        incomeBtn.classList.remove("bg-green-600", "text-black");
        incomeBtn.classList.add("text-gray-400");

        if (expenseCategories) expenseCategories.style.display = "block";
        if (incomeCategories) incomeCategories.style.display = "none";

        if (amountInput) {
          amountInput.classList.remove("text-green-500");
          amountInput.classList.add("text-red-500");
        }
      } else {
        incomeBtn.classList.add("bg-green-600", "text-black");
        incomeBtn.classList.remove("text-gray-400");

        expenseBtn.classList.remove("bg-red-600", "text-white");
        expenseBtn.classList.add("text-gray-400");

        if (expenseCategories) expenseCategories.style.display = "none";
        if (incomeCategories) incomeCategories.style.display = "block";

        if (amountInput) {
          amountInput.classList.remove("text-red-500");
          amountInput.classList.add("text-green-500");
        }
      }
    }

    expenseBtn && expenseBtn.addEventListener("click", () => setExpenseMode(true));
    incomeBtn && incomeBtn.addEventListener("click", () => setExpenseMode(false));
    setExpenseMode(true);

    /* -------------- Filtros -------------- */
    const filterDateBtn = document.getElementById("filterDateBtn");
    const filterDateMenu = document.getElementById("filterDateMenu");
    const filterCategoryBtn = document.getElementById("filterCategoryBtn");
    const filterCategoryMenu = document.getElementById("filterCategoryMenu");
    const filterTypeBtn = document.getElementById("filterTypeBtn");
    const filterTypeMenu = document.getElementById("filterTypeMenu");

    // menus reunidos para lógica de fechamento
    const filterMenus = [filterDateMenu, filterCategoryMenu, filterTypeMenu].filter(Boolean);

    let filters = {
      date: "all",
      category: "all",
      type: "all"
    };

    function toggleDropdown(menu) {
      filterMenus.forEach(m => { if (m !== menu) m.classList.add("hidden"); });
      menu && menu.classList.toggle("hidden");
    }

    filterDateBtn && filterDateBtn.addEventListener("click", () => toggleDropdown(filterDateMenu));
    filterCategoryBtn && filterCategoryBtn.addEventListener("click", () => toggleDropdown(filterCategoryMenu));
    filterTypeBtn && filterTypeBtn.addEventListener("click", () => toggleDropdown(filterTypeMenu));

    // fecha se clicar fora dos filtros (checa classes específicas para não interferir em outros elementos)
    document.addEventListener("click", e => {
      const insideFilterBtn = e.target.closest('.filter-btn');
      const insideFilterMenu = e.target.closest('.filter-menu');
      if (!insideFilterBtn && !insideFilterMenu) {
        filterMenus.forEach(m => m.classList.add('hidden'));
      }
    });

    // popula categorias dinamicamente usando categoryLabel para texto legível
    function populateCategoryFilter() {
      const transactions = getTransactions();
      const categories = [...new Set(transactions.map(tx => tx.category).filter(Boolean))];

      filterCategoryMenu && (filterCategoryMenu.innerHTML = `<button data-category="all" class="filter-option w-full text-left px-2 py-1 text-white hover:bg-zinc-700 rounded">Todas</button>`);
      categories.forEach(cat => {
        const label = transactions.find(t => t.category === cat)?.categoryLabel || cat;
        filterCategoryMenu && (filterCategoryMenu.innerHTML += `
          <button data-category="${cat}" class="filter-option w-full text-left px-2 py-1 text-white hover:bg-zinc-700 rounded">${label}</button>
        `);
      });
    }

    function applyFilters() {
      const transactions = getTransactions();
      let filtered = transactions.slice();

      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(tx => tx.type === filters.type);
      }

      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(tx => tx.category === filters.category);
      }

      if (filters.date && filters.date !== 'all') {
        const now = new Date();
        filtered = filtered.filter(tx => {
          const txDate = new Date(tx.date);
          if (isNaN(txDate)) return false;
          if (filters.date === "today") {
            return txDate.toDateString() === now.toDateString();
          }
          if (filters.date === "week") {
            const startOfWeek = new Date(now);
            startOfWeek.setHours(0,0,0,0);
            startOfWeek.setDate(now.getDate() - now.getDay()); // domingo como início
            return txDate >= startOfWeek && txDate <= now;
          }
          if (filters.date === "month") {
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
          }
          return true;
        });
      }

      renderTransactions(filtered);
    }
    /* -------------- Busca por texto -------------- */
    const searchInput = document.getElementById("searchTransactions");

    function applySearchAndFilters() {
      const term = searchInput?.value?.toLowerCase() || "";
      const transactions = getTransactions();
      let filtered = transactions.slice();

      // aplica filtros existentes
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(tx => tx.type === filters.type);
      }
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(tx => tx.category === filters.category);
      }
      if (filters.date && filters.date !== 'all') {
        const now = new Date();
        filtered = filtered.filter(tx => {
          const txDate = new Date(tx.date);
          if (isNaN(txDate)) return false;
          if (filters.date === "today") {
            return txDate.toDateString() === now.toDateString();
          }
          if (filters.date === "week") {
            const startOfWeek = new Date(now);
            startOfWeek.setHours(0,0,0,0);
            startOfWeek.setDate(now.getDate() - now.getDay());
            return txDate >= startOfWeek && txDate <= now;
          }
          if (filters.date === "month") {
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
          }
          return true;
        });
      }

      // aplica busca por texto
      if (term) {
        filtered = filtered.filter(tx => 
          tx.description?.toLowerCase().includes(term) ||
          tx.categoryLabel?.toLowerCase().includes(term) ||
          tx.category?.toLowerCase().includes(term)
        );
      }

      renderTransactions(filtered);
    }
    // listener para busca em tempo real
    searchInput?.addEventListener("input", applySearchAndFilters);

    // captura clique nas opções de filtro (delegação)
    document.addEventListener("click", e => {
      const opt = e.target.closest('.filter-option');
      if (!opt) return;
      if (opt.dataset.date) filters.date = opt.dataset.date;
      if (opt.dataset.category) filters.category = opt.dataset.category;
      if (opt.dataset.type) filters.type = opt.dataset.type;

      applyFilters();
    });

    /* -------------- LocalStorage helpers -------------- */
    function getTransactions() {
      try {
        return JSON.parse(localStorage.getItem("transactions")) || [];
      } catch (err) {
        console.error('Erro lendo transactions do localStorage', err);
        return [];
      }
    }

    function saveTransactions(list) {
      localStorage.setItem("transactions", JSON.stringify(list));
    }

    function saveTransaction(transaction) {
      const transactions = getTransactions();
      transactions.push(transaction);
      saveTransactions(transactions);
    }

    function deleteTransaction(id) {
      const transactions = getTransactions().filter(tx => String(tx.id) !== String(id));
      saveTransactions(transactions);
      renderTransactions();
      updateDashboard();
      populateCategoryFilter();
      applyFilters();
      renderDespesasChart();
      renderRelatorioChart(periodoSelecionado);
      renderTopExpenses();

    }

    /* -------------- Renderização -------------- */
    function formatCurrency(value) {
      return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatDateForDisplay(dateIso) {
      if (!dateIso) return '';
      const d = new Date(dateIso);
      if (isNaN(d)) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(2);
      return `${day}/${month}/${year}`;
    }

    function renderTransactions(list) {
      transactionsList.innerHTML = "";
      const transactions = Array.isArray(list) ? list : getTransactions();

      if (!transactions || transactions.length === 0) {
        transactionsList.innerHTML = `<p class="text-center text-gray-400 py-6">Nenhuma transação ainda.</p>`;
        return;
      }

      transactions.forEach(tx => {
        const div = document.createElement("div");
        div.className = "flex items-center gap-4 bg-zinc-900 px-4 py-3 justify-between";

        const formattedAmount = formatCurrency(tx.amount);

        const displayDate = formatDateForDisplay(tx.date);

        const icon = tx.type === 'despesa' ? 'remove' : 'add';
        const amountClass = tx.type === 'despesa' ? 'text-red-500' : 'text-green-500';

        div.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="flex size-11 items-center justify-center rounded-full bg-zinc-800 text-white">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
          <div class="flex flex-col">
            <p class="font-medium text-white">${tx.description}</p>
            <p class="text-sm text-zinc-400">${tx.categoryLabel || tx.category}</p>
          </div>
        </div>
        <div class="shrink-0 flex items-center gap-3">
          <div class="text-right">
            <p class="font-medium ${amountClass}">${tx.type === 'despesa' ? '-' : '+'} R$ ${formattedAmount}</p>
            <p class="text-right text-xs text-zinc-500">${displayDate}</p>
          </div>
          <button class="edit-tx p-2 rounded-md hover:bg-white/5" data-id="${tx.id}" aria-label="Editar transação">
            <span class="material-symbols-outlined text-zinc-400">edit</span>
          </button>
          <button class="delete-tx p-2 rounded-md hover:bg-white/5" data-id="${tx.id}" aria-label="Excluir transação">
            <span class="material-symbols-outlined text-zinc-400">delete</span>
          </button>
        </div>
      `;

        transactionsList.appendChild(div);
      });
    }

    // delegação para botão excluir
    transactionsList && transactionsList.addEventListener('click', (e) => {
    // Excluir
    const delBtn = e.target.closest('.delete-tx');
    if (delBtn) {
      const id = delBtn.dataset.id;
      if (id && confirm('Excluir essa transação?')) {
        deleteTransaction(id);
      }
      return;
    }

    // Editar
    const editBtn = e.target.closest('.edit-tx');
    if (editBtn) {
      const id = editBtn.dataset.id;
      const transactions = getTransactions();
      const tx = transactions.find(t => t.id === id);
      if (!tx) return;

      editingTransactionId = id; // marca que estamos editando

      // Preenche o formulário com os dados
      setExpenseMode(tx.type === "despesa");
      document.getElementById("amount").value = tx.amount;
      document.getElementById("description").value = tx.description;
      document.getElementById("date").value = tx.date;
      document.getElementById("account").value = tx.account || "";

      // Seleciona a categoria correta
      const categorySelect = document.getElementById("category");
      if (categorySelect) categorySelect.value = tx.category;

      // Abre o modal
      modal && modal.classList.remove("hidden");
      }
    });
    

    /* -------------- Dashboard (única definição) -------------- */
    function updateDashboard() {
      const transactions = getTransactions();
      let entradas = 0, saidas = 0;

      transactions.forEach(tx => {
        if (tx.type === "receita") entradas += Number(tx.amount || 0);
        else saidas += Number(tx.amount || 0);
      });

      const saldo = entradas - saidas;

      const entradasEl = document.getElementById("totalEntradas");
      const saidasEl = document.getElementById("totalSaidas");
      const saldoEl = document.getElementById("totalSaldo");
      const saldoConsolidadoEl = document.getElementById("saldo_consolidado");
      const despesasMesEl = document.querySelector("#despesas_mes");

      if (entradasEl) entradasEl.textContent = `R$ ${formatCurrency(entradas)}`;
      if (saidasEl) saidasEl.textContent = `R$ ${formatCurrency(saidas)}`;
      if (saldoEl) {
        saldoEl.textContent = `R$ ${formatCurrency(saldo)}`;
        saldoEl.className = saldo >= 0 ? "text-green-500 font-bold" : "text-red-500 font-bold";
      }
      if (saldoConsolidadoEl) {
        saldoConsolidadoEl.textContent = `R$ ${formatCurrency(saldo)}`;
      }
      if (despesasMesEl) despesasMesEl.textContent = `R$ ${formatCurrency(saidas)}`;
    }

    /* -------------- Submissão do formulário -------------- */
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const amountRaw = (document.getElementById("amount").value || "").toString().trim();
        let amountNumber = parseFloat(amountRaw.replace(/\./g, '').replace(',', '.'));
        if (isNaN(amountNumber)) amountNumber = 0;

        const categorySelect = document.getElementById("category");
        const categoryValue = categorySelect ? categorySelect.value : "";
        const categoryLabel = (categorySelect && categorySelect.options[categorySelect.selectedIndex])
          ? categorySelect.options[categorySelect.selectedIndex].text
          : categoryValue;

        const description = (document.getElementById("description").value || "").trim() || categoryLabel || "";
        const date = document.getElementById("date").value || new Date().toISOString().slice(0,10);
        const account = document.getElementById("account").value || "";

        const transaction = {
          id: editingTransactionId || (Date.now().toString(36) + Math.random().toString(36).slice(2,8)),
          type: isExpense ? "despesa" : "receita",
          amount: Math.abs(amountNumber),
          category: categoryValue,
          categoryLabel,
          description,
          date,
          account
        };

        if (editingTransactionId) {
          // Atualiza transação existente
          let transactions = getTransactions();
          transactions = transactions.map(tx => tx.id === editingTransactionId ? transaction : tx);
          saveTransactions(transactions);
          editingTransactionId = null; // reset
        } else {
          // Nova transação
          saveTransaction(transaction);
        }

        renderTransactions();
        updateDashboard();
        populateCategoryFilter();
        applyFilters();
        renderBudgets();
        renderDespesasChart();
        renderRelatorioChart(periodoSelecionado);
        renderTopExpenses();

        modal && modal.classList.add("hidden");
        form.reset();
        setExpenseMode(true);
      });
    }


    /* -------------- Seed / Clear (útil para demo) -------------- */
    function seedSampleData() {
      const now = new Date();
      const sample = [
        { id: 's1', type: 'despesa', amount: 75.60, category: 'alimentacao', categoryLabel: '🍽️ Alimentação', description: 'Almoço universitário', date: isoDaysAgo(2), account: 'carteira' },
        { id: 's2', type: 'despesa', amount: 30.00, category: 'transporte', categoryLabel: '🚗 Transporte', description: 'Ônibus', date: isoDaysAgo(1), account: 'carteira' },
        { id: 's3', type: 'receita', amount: 1200.00, category: 'salario', categoryLabel: '💰 Salário', description: 'Estágio', date: isoDaysAgo(10), account: 'conta_corrente' },
        { id: 's4', type: 'despesa', amount: 45.50, category: 'lazer', categoryLabel: '🎬 Lazer', description: 'Cinema', date: isoDaysAgo(7), account: 'carteira' },
        { id: 's5', type: 'despesa', amount: 400.00, category: 'moradia', categoryLabel: '🏠 Moradia', description: 'Aluguel (parcela)', date: isoDaysAgo(15), account: 'conta_corrente' },
        { id: 's6', type: 'receita', amount: 200.00, category: 'freelance', categoryLabel: '💻 Freelance', description: 'Projeto pequeno', date: isoDaysAgo(20), account: 'conta_corrente' }
      ];
      saveTransactions(sample);
      renderTransactions();
      updateDashboard();
      populateCategoryFilter();
      applyFilters();
      renderDespesasChart();
      renderRelatorioChart(periodoSelecionado);
      renderTopExpenses();
    }

    function isoDaysAgo(days) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d.toISOString().slice(0,10);
    }

    function clearAllData() {
      if (!confirm('Tem certeza que deseja limpar todos os dados (isso apagará as transações salvas localmente)?')) return;
      localStorage.removeItem('transactions');
      renderTransactions();
      updateDashboard();
      populateCategoryFilter();
      applyFilters();
      renderDespesasChart();
      renderRelatorioChart(periodoSelecionado);
      renderTopExpenses();
    }

    window.seedSampleData = seedSampleData;
    window.clearAllData = clearAllData;

    /* -------------- Inicialização -------------- */
    renderTransactions();
    renderBudgets();
    updateDashboard();
    populateCategoryFilter();
    applyFilters();
    renderDespesasChart();
    renderRelatorioChart(periodoSelecionado);
    renderTopExpenses();

    /* ---------- LÓGICA PERFIL ---------- */
    // Voltar para home
    document.getElementById("backToHome")?.addEventListener("click", () => {
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      document.getElementById("home")?.classList.add("active");
      window.scrollTo(0, 0);
    });

    // Abrir tela de detalhes do perfil
    document.getElementById("openProfileDetails")?.addEventListener("click", () => {
      document.getElementById("profileDetailsScreen")?.classList.remove("hidden");
    });

    // Fechar tela de detalhes do perfil
    document.getElementById("closeProfileDetails")?.addEventListener("click", () => {
      document.getElementById("profileDetailsScreen")?.classList.add("hidden");
    });

    // Abrir modal de edição
    document.getElementById("openEditProfileModal")?.addEventListener("click", () => {
      document.getElementById("editProfileModal")?.classList.remove("hidden");
    });

    // Fechar modal de edição
    document.getElementById("cancelEditProfile")?.addEventListener("click", () => {
      document.getElementById("editProfileModal")?.classList.add("hidden");
    });

    // Salvar (placeholder)
    document.getElementById("editProfileForm")?.addEventListener("submit", e => {
      e.preventDefault();
      alert("Dados atualizados! (placeholder)");
      document.getElementById("editProfileModal")?.classList.add("hidden");
    });

  });
})();
