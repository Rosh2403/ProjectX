type PurchaseOrderStatus = "Approved" | "Pending" | "In Review";

type PurchaseOrder = {
  poNumber: string;
  clientName: string;
  item: string;
  amount: number;
  date: string;
  status: PurchaseOrderStatus;
  approver: string;
};

const purchaseOrders: PurchaseOrder[] = [
  { poNumber: "PO-2026-001", clientName: "Apex Retail", item: "Warehouse scanners", amount: 24500, date: "2026-01-12", status: "Approved", approver: "M. Shah" },
  { poNumber: "PO-2026-002", clientName: "Northstar Labs", item: "Lab safety gloves", amount: 4800, date: "2026-01-16", status: "Pending", approver: "A. Kumar" },
  { poNumber: "PO-2026-003", clientName: "Apex Retail", item: "Barcode labels", amount: 1320, date: "2026-01-20", status: "In Review", approver: "D. Lim" },
  { poNumber: "PO-2026-004", clientName: "Horizon Foods", item: "Cold storage sensors", amount: 9100, date: "2026-01-24", status: "Approved", approver: "M. Shah" },
  { poNumber: "PO-2026-005", clientName: "Nimbus Logistics", item: "Fleet tablets", amount: 17800, date: "2026-02-01", status: "Pending", approver: "K. Prasad" },
  { poNumber: "PO-2026-006", clientName: "Northstar Labs", item: "Calibration service", amount: 6200, date: "2026-02-03", status: "Approved", approver: "A. Kumar" },
  { poNumber: "PO-2026-007", clientName: "Horizon Foods", item: "Packaging tapes", amount: 950, date: "2026-02-05", status: "In Review", approver: "D. Lim" },
];

const clientFilter = document.getElementById("clientFilter") as HTMLSelectElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const orderRows = document.getElementById("orderRows") as HTMLTableSectionElement;
const stats = document.getElementById("stats") as HTMLDivElement;
const emptyState = document.getElementById("emptyState") as HTMLParagraphElement;

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fullDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" });

function buildClientOptions(): void {
  const uniqueClients = Array.from(new Set(purchaseOrders.map((order) => order.clientName))).sort();
  uniqueClients.forEach((clientName) => {
    const option = document.createElement("option");
    option.value = clientName;
    option.textContent = clientName;
    clientFilter.appendChild(option);
  });
}

function renderStats(orders: PurchaseOrder[]): void {
  const approvedCount = orders.filter((order) => order.status === "Approved").length;
  const pendingCount = orders.filter((order) => order.status === "Pending").length;
  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

  const cards = [
    { label: "Visible Orders", value: String(orders.length) },
    { label: "Approved", value: String(approvedCount) },
    { label: "Pending", value: String(pendingCount) },
    { label: "Total Value", value: currency.format(totalAmount) },
  ];

  stats.innerHTML = cards
    .map(
      (card) => `
      <article class="stat-card">
        <p class="stat-label">${card.label}</p>
        <p class="stat-value">${card.value}</p>
      </article>
    `
    )
    .join("");
}

function getStatusClass(status: PurchaseOrderStatus): string {
  if (status === "Approved") return "status-approved";
  if (status === "Pending") return "status-pending";
  return "status-review";
}

function renderRows(orders: PurchaseOrder[]): void {
  orderRows.innerHTML = orders
    .map(
      (order) => `
      <tr>
        <td>${order.poNumber}</td>
        <td>${order.clientName}</td>
        <td>${order.item}</td>
        <td class="amount">${currency.format(order.amount)}</td>
        <td>${fullDate.format(new Date(order.date))}</td>
        <td><span class="status-pill ${getStatusClass(order.status)}">${order.status}</span></td>
        <td>${order.approver}</td>
      </tr>
    `
    )
    .join("");
  emptyState.classList.toggle("hidden", orders.length > 0);
}

function applyFilters(): void {
  const selectedClient = clientFilter.value;
  const q = searchInput.value.trim().toLowerCase();

  const filtered = purchaseOrders.filter((order) => {
    const clientMatch = selectedClient === "ALL" || order.clientName === selectedClient;
    if (!clientMatch) return false;
    if (!q) return true;

    const searchable = `${order.poNumber} ${order.item} ${order.approver} ${order.clientName}`.toLowerCase();
    return searchable.includes(q);
  });

  renderStats(filtered);
  renderRows(filtered);
}

function init(): void {
  buildClientOptions();
  clientFilter.addEventListener("change", applyFilters);
  searchInput.addEventListener("input", applyFilters);
  applyFilters();
}

init();
