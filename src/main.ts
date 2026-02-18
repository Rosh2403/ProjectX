import "./styles.css";

type PurchaseOrder = {
  id: string;
  clientName: string;
  contractLengthMonths: number;
  contractValue: number;
  sentDate: string;
};

type InvoiceClaim = {
  id: string;
  purchaseOrderId: string;
  amount: number;
  claimDate: string;
};

type TabName = "dashboard" | "orders" | "createOrder" | "invoices";
type OrderSortOption = "company-asc" | "company-desc" | "date-desc" | "date-asc";

const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-2026-001", clientName: "Apex Retail", contractLengthMonths: 12, contractValue: 120000, sentDate: "2026-01-12" },
  { id: "PO-2026-002", clientName: "Northstar Labs", contractLengthMonths: 8, contractValue: 84000, sentDate: "2026-01-24" },
];

const invoiceClaims: InvoiceClaim[] = [
  { id: "INV-001", purchaseOrderId: "PO-2026-001", amount: 23000, claimDate: "2026-02-01" },
  { id: "INV-002", purchaseOrderId: "PO-2026-001", amount: 18000, claimDate: "2026-02-15" },
  { id: "INV-003", purchaseOrderId: "PO-2026-002", amount: 20000, claimDate: "2026-02-09" },
];

const purchaseOrderForm = document.getElementById("purchaseOrderForm") as HTMLFormElement;
const invoiceForm = document.getElementById("invoiceForm") as HTMLFormElement;

const clientNameInput = document.getElementById("clientNameInput") as HTMLInputElement;
const clientNameSuggestions = document.getElementById("clientNameSuggestions") as HTMLDataListElement;
const contractLengthInput = document.getElementById("contractLengthInput") as HTMLInputElement;
const contractValueInput = document.getElementById("contractValueInput") as HTMLInputElement;
const orderSentDateInput = document.getElementById("orderSentDateInput") as HTMLInputElement;
const orderSearchInput = document.getElementById("orderSearchInput") as HTMLInputElement;
const orderSortSelect = document.getElementById("orderSortSelect") as HTMLSelectElement;

const invoicePurchaseOrderSelect = document.getElementById("invoicePurchaseOrderSelect") as HTMLSelectElement;
const claimAmountInput = document.getElementById("claimAmountInput") as HTMLInputElement;
const claimDateInput = document.getElementById("claimDateInput") as HTMLInputElement;

const purchaseOrderList = document.getElementById("purchaseOrderList") as HTMLDivElement;
const invoiceList = document.getElementById("invoiceList") as HTMLDivElement;
const metricRow = document.getElementById("metricRow") as HTMLDivElement;
const dashboardStats = document.getElementById("dashboardStats") as HTMLDivElement;
const dashboardClientList = document.getElementById("dashboardClientList") as HTMLDivElement;
const dashboardMonthlyList = document.getElementById("dashboardMonthlyList") as HTMLDivElement;

const dashboardPanel = document.getElementById("dashboardPanel") as HTMLElement;
const ordersPanel = document.getElementById("ordersPanel") as HTMLElement;
const createOrderPanel = document.getElementById("createOrderPanel") as HTMLElement;
const invoicePanel = document.getElementById("invoicePanel") as HTMLElement;
const dashboardTab = document.getElementById("dashboardTab") as HTMLButtonElement;
const ordersTab = document.getElementById("ordersTab") as HTMLButtonElement;
const createOrderTab = document.getElementById("createOrderTab") as HTMLButtonElement;
const invoiceTab = document.getElementById("invoiceTab") as HTMLButtonElement;

const currency = new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 0 });
const fullDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" });
const monthYear = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short" });

function setActiveTab(tab: TabName): void {
  const dashboardActive = tab === "dashboard";
  const ordersActive = tab === "orders";
  const createActive = tab === "createOrder";
  const invoiceActive = tab === "invoices";
  dashboardTab.classList.toggle("active", dashboardActive);
  ordersTab.classList.toggle("active", ordersActive);
  createOrderTab.classList.toggle("active", createActive);
  invoiceTab.classList.toggle("active", invoiceActive);
  dashboardPanel.classList.toggle("active", dashboardActive);
  ordersPanel.classList.toggle("active", ordersActive);
  createOrderPanel.classList.toggle("active", createActive);
  invoicePanel.classList.toggle("active", invoiceActive);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function totalInvoicedForPurchaseOrder(purchaseOrderId: string): number {
  return invoiceClaims
    .filter((claim) => claim.purchaseOrderId === purchaseOrderId)
    .reduce((sum, claim) => sum + claim.amount, 0);
}

function renderHeaderMetrics(): void {
  const totalContractValue = purchaseOrders.reduce((sum, order) => sum + order.contractValue, 0);
  const totalInvoiced = invoiceClaims.reduce((sum, claim) => sum + claim.amount, 0);
  const remaining = Math.max(totalContractValue - totalInvoiced, 0);

  metricRow.innerHTML = [
    { label: "Contracts", value: String(purchaseOrders.length) },
    { label: "Total Value", value: currency.format(totalContractValue) },
    { label: "Invoiced", value: currency.format(totalInvoiced) },
    { label: "Remaining", value: currency.format(remaining) },
  ]
    .map(
      (metric) => `
      <article class="metric">
        <p class="metric-label">${metric.label}</p>
        <p class="metric-value">${metric.value}</p>
      </article>
    `
    )
    .join("");
}

function renderInvoicePurchaseOrderOptions(): void {
  invoicePurchaseOrderSelect.innerHTML = "";
  purchaseOrders.forEach((order) => {
    const option = document.createElement("option");
    option.value = order.id;
    option.textContent = `${order.id} • ${order.clientName}`;
    invoicePurchaseOrderSelect.appendChild(option);
  });
  invoicePurchaseOrderSelect.disabled = purchaseOrders.length === 0;
}

function renderClientNameSuggestions(): void {
  const uniqueClientNames = [...new Set(purchaseOrders.map((order) => order.clientName.trim()))]
    .filter((name) => name.length > 0)
    .sort((a, b) => a.localeCompare(b));

  clientNameSuggestions.innerHTML = "";
  uniqueClientNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    clientNameSuggestions.appendChild(option);
  });
}

function renderPurchaseOrders(): void {
  const query = orderSearchInput.value.trim().toLowerCase();
  const sortOption = orderSortSelect.value as OrderSortOption;
  const filteredOrders = purchaseOrders.filter((order) => {
    if (!query) return true;
    return order.clientName.toLowerCase().includes(query) || order.id.toLowerCase().includes(query);
  });
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortOption === "company-desc") {
      return b.clientName.localeCompare(a.clientName);
    }
    if (sortOption === "date-desc") {
      return b.sentDate.localeCompare(a.sentDate);
    }
    if (sortOption === "date-asc") {
      return a.sentDate.localeCompare(b.sentDate);
    }
    return a.clientName.localeCompare(b.clientName);
  });

  purchaseOrderList.innerHTML = sortedOrders
    .map(
      (order) => `
      <article class="item-card">
        <div class="item-head">
          <h3>${order.id}</h3>
          <span>Sent ${fullDate.format(new Date(order.sentDate))}</span>
        </div>
        <p class="client">${order.clientName}</p>
        <p class="meta">${order.contractLengthMonths} months contract</p>
        <p class="money">${currency.format(order.contractValue)}</p>
        <div class="progress-wrap">
          <div class="progress-label">
            <span>Invoiced: ${currency.format(totalInvoicedForPurchaseOrder(order.id))}</span>
            <span>Remaining: ${currency.format(Math.max(order.contractValue - totalInvoicedForPurchaseOrder(order.id), 0))}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${Math.min((totalInvoicedForPurchaseOrder(order.id) / order.contractValue) * 100, 100)}%"></div>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  if (!sortedOrders.length) {
    purchaseOrderList.innerHTML = `<p class="empty">${purchaseOrders.length ? "No orders match your search." : "No purchase orders yet."}</p>`;
  }
}

function renderInvoiceClaims(): void {
  const sortedClaims = [...invoiceClaims].sort((a, b) => b.claimDate.localeCompare(a.claimDate));
  invoiceList.innerHTML = sortedClaims
    .map((claim) => {
      const order = purchaseOrders.find((entry) => entry.id === claim.purchaseOrderId);
      return `
        <article class="item-card">
          <div class="item-head">
            <h3>${claim.id}</h3>
            <span>${fullDate.format(new Date(claim.claimDate))}</span>
          </div>
          <p class="client">${order ? `${order.clientName} (${order.id})` : claim.purchaseOrderId}</p>
          <p class="money">${currency.format(claim.amount)}</p>
          <p class="meta">Progress claim added to contract</p>
        </article>
      `;
    })
    .join("");

  if (!invoiceClaims.length) {
    invoiceList.innerHTML = `<p class="empty">No invoice claims yet.</p>`;
  }
}

function renderDashboard(): void {
  const totalContractValue = purchaseOrders.reduce((sum, order) => sum + order.contractValue, 0);
  const totalInvoiced = invoiceClaims.reduce((sum, claim) => sum + claim.amount, 0);
  const completionPct = totalContractValue ? Math.round((totalInvoiced / totalContractValue) * 100) : 0;

  dashboardStats.innerHTML = [
    { label: "Active Clients", value: String(new Set(purchaseOrders.map((order) => order.clientName)).size) },
    { label: "Total Orders", value: String(purchaseOrders.length) },
    { label: "Avg Contract", value: currency.format(purchaseOrders.length ? Math.round(totalContractValue / purchaseOrders.length) : 0) },
    { label: "Completion", value: `${completionPct}%` },
  ]
    .map(
      (metric) => `
      <article class="metric small">
        <p class="metric-label">${metric.label}</p>
        <p class="metric-value">${metric.value}</p>
      </article>
      `
    )
    .join("");

  const clientSummary = [...new Set(purchaseOrders.map((order) => order.clientName))]
    .map((clientName) => {
      const contracts = purchaseOrders.filter((order) => order.clientName === clientName);
      const clientContractValue = contracts.reduce((sum, order) => sum + order.contractValue, 0);
      const clientInvoiced = contracts.reduce((sum, order) => sum + totalInvoicedForPurchaseOrder(order.id), 0);
      return {
        clientName,
        contracts: contracts.length,
        contractValue: clientContractValue,
        invoiced: clientInvoiced,
        remaining: Math.max(clientContractValue - clientInvoiced, 0),
      };
    })
    .sort((a, b) => a.clientName.localeCompare(b.clientName));

  dashboardClientList.innerHTML = clientSummary
    .map(
      (client) => `
      <article class="item-card">
        <div class="item-head">
          <h3>${client.clientName}</h3>
          <span>${client.contracts} contract${client.contracts > 1 ? "s" : ""}</span>
        </div>
        <p class="meta">Contract Value: ${currency.format(client.contractValue)}</p>
        <p class="meta">Invoiced: ${currency.format(client.invoiced)}</p>
        <p class="meta">Remaining: ${currency.format(client.remaining)}</p>
      </article>
      `
    )
    .join("");

  if (!clientSummary.length) {
    dashboardClientList.innerHTML = `<p class="empty">No client data yet.</p>`;
  }

  const monthlySummaryMap = new Map<string, number>();
  invoiceClaims.forEach((claim) => {
    const monthKey = claim.claimDate.slice(0, 7);
    monthlySummaryMap.set(monthKey, (monthlySummaryMap.get(monthKey) ?? 0) + claim.amount);
  });
  const monthlySummary = [...monthlySummaryMap.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  dashboardMonthlyList.innerHTML = monthlySummary
    .map(([month, total]) => {
      const monthLabel = monthYear.format(new Date(`${month}-01`));
      return `
        <article class="item-card row">
          <p class="client">${monthLabel}</p>
          <p class="money">${currency.format(total)}</p>
        </article>
      `;
    })
    .join("");

  if (!monthlySummary.length) {
    dashboardMonthlyList.innerHTML = `<p class="empty">No invoice claims yet.</p>`;
  }
}

function refreshScreen(): void {
  renderHeaderMetrics();
  renderDashboard();
  renderClientNameSuggestions();
  renderInvoicePurchaseOrderOptions();
  renderPurchaseOrders();
  renderInvoiceClaims();
}

function createId(prefix: "PO" | "INV"): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function onPurchaseOrderSubmit(event: SubmitEvent): void {
  event.preventDefault();

  const clientName = clientNameInput.value.trim();
  const contractLengthMonths = Number(contractLengthInput.value);
  const contractValue = Number(contractValueInput.value);
  const sentDate = orderSentDateInput.value;

  if (!clientName || contractLengthMonths <= 0 || contractValue <= 0 || !sentDate) {
    return;
  }

  purchaseOrders.unshift({
    id: createId("PO"),
    clientName,
    contractLengthMonths,
    contractValue,
    sentDate,
  });

  purchaseOrderForm.reset();
  orderSentDateInput.value = todayIso();
  refreshScreen();
  setActiveTab("orders");
}

function onInvoiceSubmit(event: SubmitEvent): void {
  event.preventDefault();

  const purchaseOrderId = invoicePurchaseOrderSelect.value;
  const amount = Number(claimAmountInput.value);
  const claimDate = claimDateInput.value;

  if (!purchaseOrderId || amount <= 0 || !claimDate) {
    return;
  }

  invoiceClaims.unshift({
    id: createId("INV"),
    purchaseOrderId,
    amount,
    claimDate,
  });

  invoiceForm.reset();
  claimDateInput.value = todayIso();
  refreshScreen();
}

function init(): void {
  claimDateInput.value = todayIso();
  orderSentDateInput.value = todayIso();
  purchaseOrderForm.addEventListener("submit", onPurchaseOrderSubmit);
  invoiceForm.addEventListener("submit", onInvoiceSubmit);
  orderSearchInput.addEventListener("input", renderPurchaseOrders);
  orderSortSelect.addEventListener("change", renderPurchaseOrders);
  dashboardTab.addEventListener("click", () => setActiveTab("dashboard"));
  ordersTab.addEventListener("click", () => setActiveTab("orders"));
  createOrderTab.addEventListener("click", () => setActiveTab("createOrder"));
  invoiceTab.addEventListener("click", () => setActiveTab("invoices"));
  refreshScreen();
  setActiveTab("dashboard");
}

init();
