create table if not exists public.purchase_orders (
  id text primary key,
  client_name text not null,
  contract_length_months integer not null check (contract_length_months > 0),
  contract_value numeric not null check (contract_value > 0),
  sent_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_claims (
  id text primary key,
  purchase_order_id text not null references public.purchase_orders(id) on delete cascade,
  amount numeric not null check (amount > 0),
  claim_date date not null,
  created_at timestamptz not null default now()
);

alter table public.purchase_orders enable row level security;
alter table public.invoice_claims enable row level security;

drop policy if exists "Allow all read/write for anon and authenticated on purchase_orders" on public.purchase_orders;
create policy "Allow all read/write for anon and authenticated on purchase_orders"
  on public.purchase_orders
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow all read/write for anon and authenticated on invoice_claims" on public.invoice_claims;
create policy "Allow all read/write for anon and authenticated on invoice_claims"
  on public.invoice_claims
  for all
  to anon, authenticated
  using (true)
  with check (true);
