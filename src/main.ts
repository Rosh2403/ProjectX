import "./styles.css";

type PurchaseOrder = {
  id: string;
  clientName: string;
  contractLengthMonths: number;
  contractValue: number;
  createdAt: string;
};

type InvoiceClaim = {
  id: string;
  purchaseOrderId: string;
  amount: number;
  claimDate: string;
};

type TabName = "orders" | "invoices";

const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-2026-001", clientName: "Apex Retail", contractLengthMonths: 12, contractValue: 120000, createdAt: "2026-01-12" },
  { id: "PO-2026-002", clientName: "Northstar Labs", contractLengthMonths: 8, contractValue: 84000, createdAt: "2026-01-24" },
];

const invoiceClaims: InvoiceClaim[] = [
  { id: "INV-001", purchaseOrderId: "PO-2026-001", amount: 23000, claimDate: "2026-02-01" },
  { id: "INV-002", purchaseOrderId: "PO-2026-001", amount: 18000, claimDate: "2026-02-15" },
  { id: "INV-003", purchaseOrderId: "PO-2026-002", amount: 20000, claimDate: "2026-02-09" },
];

const purchaseOrderForm = document.getElementById("purchaseOrderForm") as HTMLFormElement;
const invoiceForm = document.getElementById("invoiceForm") as HTMLFormElement;

const clientNameInput = document.getElementById("clientNameInput") as HTMLInputElement;
const contractLengthInput = document.getElementById("contractLengthInput") as HTMLInputElement;
const contractValueInput = document.getElementById("contractValueInput") as HTMLInputElement;

const invoicePurchaseOrderSelect = document.getElementById("invoicePurchaseOrderSelect") as HTMLSelectElement;
const claimAmountInput = document.getElementById("claimAmountInput") as HTMLInputElement;
const claimDateInput = document.getElementById("claimDateInput") as HTMLInputElement;

const purchaseOrderList = document.getElementById("purchaseOrderList") as HTMLDivElement;
const invoiceList = document.getElementById("invoiceList") as HTMLDivElement;
const metricRow = document.getElementById("metricRow") as HTMLDivElement;

const ordersPanel = document.getElementById("ordersPanel") as HTMLElement;
const invoicePanel = document.getElementById("invoicePanel") as HTMLElement;
const ordersTab = document.getElementById("ordersTab") as HTMLButtonElement;
const invoiceTab = document.getElementById("invoiceTab") as HTMLButtonElement;

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fullDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" });

function setActiveTab(tab: TabName): void {
  const ordersActive = tab === "orders";
  ordersTab.classList.toggle("active", ordersActive);
  invoiceTab.classList.toggle("active", !ordersActive);
  ordersPanel.classList.toggle("active", ordersActive);
  invoicePanel.classList.toggle("active", !ordersActive);
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

function renderPurchaseOrders(): void {
  purchaseOrderList.innerHTML = purchaseOrders
    .map(
      (order) => `
      <article class="item-card">
        <div class="item-head">
          <h3>${order.id}</h3>
          <span>${fullDate.format(new Date(order.createdAt))}</span>
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

  if (!purchaseOrders.length) {
    purchaseOrderList.innerHTML = `<p class="empty">No purchase orders yet.</p>`;
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

function refreshScreen(): void {
  renderHeaderMetrics();
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

  if (!clientName || contractLengthMonths <= 0 || contractValue <= 0) {
    return;
  }

  purchaseOrders.unshift({
    id: createId("PO"),
    clientName,
    contractLengthMonths,
    contractValue,
    createdAt: todayIso(),
  });

  purchaseOrderForm.reset();
  refreshScreen();
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
  purchaseOrderForm.addEventListener("submit", onPurchaseOrderSubmit);
  invoiceForm.addEventListener("submit", onInvoiceSubmit);
  ordersTab.addEventListener("click", () => setActiveTab("orders"));
  invoiceTab.addEventListener("click", () => setActiveTab("invoices"));
  refreshScreen();
  setActiveTab("orders");
}

init();
