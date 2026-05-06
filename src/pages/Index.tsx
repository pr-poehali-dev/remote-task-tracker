import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import Icon from "@/components/ui/icon";

type Section = "catalog" | "stock" | "invoices" | "defects" | "orders" | "reports" | "ideas";

const NAV_ITEMS = [
  { id: "catalog" as Section, label: "Каталог товаров", icon: "Package", color: "text-blue-400" },
  { id: "stock" as Section, label: "Остатки на складах", icon: "Warehouse", color: "text-teal-400" },
  { id: "invoices" as Section, label: "Накладные", icon: "FileText", color: "text-indigo-400" },
  { id: "defects" as Section, label: "Брак", icon: "AlertTriangle", color: "text-red-400" },
  { id: "orders" as Section, label: "Заказы / Новинки", icon: "ShoppingCart", color: "text-amber-400" },
  { id: "reports" as Section, label: "Отчётность", icon: "BarChart2", color: "text-emerald-400" },
  { id: "ideas" as Section, label: "Идеи", icon: "Lightbulb", color: "text-purple-400" },
];

type CatalogItem = { name: string; category: string; price: number; stock: number; status: string };
type StockItem = { warehouse: string; total: number; reserved: number; available: number; fill: number };
type Invoice = { number: string; date: string; supplier: string; amount: string; status: string; type: string };
type Defect = { product: string; qty: number; date: string; reason: string; responsible: string; status: string };
type Order = { client: string; items: number; amount: string; date: string; status: string; priority: string };
type Idea = { id: number; title: string; votes: number; status: string; date: string };

const EMPTY_CATALOG: CatalogItem[] = [];
const EMPTY_STOCK: StockItem[] = [];
const EMPTY_INVOICES: Invoice[] = [];
const EMPTY_DEFECTS: Defect[] = [];
const EMPTY_ORDERS: Order[] = [];
const EMPTY_IDEAS: Idea[] = [];

// --- Excel helpers ---
function exportToExcel(data: object[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Лист1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function useExcelImport<T>(onImport: (rows: T[]) => void) {
  const ref = useRef<HTMLInputElement>(null);
  const trigger = () => ref.current?.click();
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<T>(ws);
      onImport(rows);
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };
  return { ref, trigger, handle };
}

// --- Status Badge ---
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "В наличии": "bg-emerald-100 text-emerald-700",
    "Мало": "bg-amber-100 text-amber-700",
    "Нет": "bg-red-100 text-red-700",
    "Проведена": "bg-emerald-100 text-emerald-700",
    "На проверке": "bg-amber-100 text-amber-700",
    "Отклонена": "bg-red-100 text-red-700",
    "На списание": "bg-red-100 text-red-700",
    "Возврат поставщику": "bg-amber-100 text-amber-700",
    "Списано": "bg-gray-100 text-gray-600",
    "Новый": "bg-blue-100 text-blue-700",
    "В работе": "bg-indigo-100 text-indigo-700",
    "Комплектация": "bg-purple-100 text-purple-700",
    "Новинка": "bg-pink-100 text-pink-700",
    "В плане": "bg-blue-100 text-blue-700",
    "Обсуждение": "bg-amber-100 text-amber-700",
    "Реализовано": "bg-emerald-100 text-emerald-700",
    "Идея": "bg-purple-100 text-purple-700",
    "Приход": "bg-emerald-100 text-emerald-700",
    "Расход": "bg-red-100 text-red-700",
    "Возврат": "bg-amber-100 text-amber-700",
    "Высокий": "bg-red-100 text-red-700",
    "Средний": "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// --- Excel Toolbar ---
function ExcelToolbar({ onExport, onImportRef, onImportHandle, label }: {
  onExport: () => void;
  onImportRef: React.RefObject<HTMLInputElement | null>;
  onImportHandle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input ref={onImportRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onImportHandle} />
      <button
        onClick={() => onImportRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <Icon name="Upload" size={15} />
        Загрузить Excel
      </button>
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <Icon name="Download" size={15} />
        {label || "Экспорт"}
      </button>
    </div>
  );
}

// --- Empty State ---
function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon name="FileSpreadsheet" size={28} className="text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground mb-1">Нет данных</p>
      <p className="text-sm text-muted-foreground mb-4">Загрузите файл Excel или добавьте записи вручную</p>
      <button onClick={onImport} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
        <Icon name="Upload" size={15} />
        Загрузить Excel
      </button>
    </div>
  );
}

// --- CATALOG ---
function CatalogView() {
  const [items, setItems] = useState<CatalogItem[]>(EMPTY_CATALOG);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [statusFilter, setStatusFilter] = useState("Все");

  const { ref, handle } = useExcelImport<CatalogItem>((rows) => setItems(rows));

  const categories = ["Все", ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];
  const statuses = ["Все", "В наличии", "Мало", "Нет"];

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Все" || item.category === category;
    const matchStatus = statusFilter === "Все" || item.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const total = items.length;
  const inStock = items.filter(i => i.status === "В наличии").length;
  const outOfStock = items.filter(i => i.status === "Нет").length;

  const doExport = () => exportToExcel(items, "каталог_товаров");

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Каталог товаров</h2>
          <p className="text-muted-foreground text-sm mt-1">{total} позиций</p>
        </div>
        <ExcelToolbar onExport={doExport} onImportRef={ref} onImportHandle={handle} label="Скачать Excel" />
      </div>

      {items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: "Всего позиций", value: total, icon: "Package", color: "bg-blue-50 text-blue-600" },
              { label: "В наличии", value: inStock, icon: "CheckCircle", color: "bg-emerald-50 text-emerald-600" },
              { label: "Нет в наличии", value: outOfStock, icon: "XCircle", color: "bg-red-50 text-red-600" },
            ].map((s, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border border-border flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon name={s.icon} size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </>
      )}

      {items.length === 0 ? (
        <EmptyState onImport={() => ref.current?.click()} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Наименование</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Категория</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Цена</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Остаток</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Ничего не найдено</td></tr>
                ) : filtered.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-5 py-4 font-medium text-sm">{item.name}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{item.category}</td>
                    <td className="px-5 py-4 text-right text-sm font-medium">{Number(item.price || 0).toLocaleString("ru-RU")} ₽</td>
                    <td className="px-5 py-4 text-right text-sm font-mono">{item.stock}</td>
                    <td className="px-5 py-4 text-center"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STOCK ---
function StockView() {
  const [items, setItems] = useState<StockItem[]>(EMPTY_STOCK);
  const { ref, handle } = useExcelImport<StockItem>((rows) => setItems(rows));
  const doExport = () => exportToExcel(items, "остатки_на_складах");

  const totalAll = items.reduce((s, w) => s + Number(w.total || 0), 0);
  const reservedAll = items.reduce((s, w) => s + Number(w.reserved || 0), 0);
  const availableAll = items.reduce((s, w) => s + Number(w.available || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Остатки на складах</h2>
          <p className="text-muted-foreground text-sm mt-1">{items.length} складов</p>
        </div>
        <ExcelToolbar onExport={doExport} onImportRef={ref} onImportHandle={handle} label="Скачать Excel" />
      </div>

      {items.length === 0 ? <EmptyState onImport={() => ref.current?.click()} /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Общий остаток", value: totalAll.toLocaleString("ru-RU"), icon: "Box" },
              { label: "Зарезервировано", value: reservedAll.toLocaleString("ru-RU"), icon: "Lock" },
              { label: "Свободно", value: availableAll.toLocaleString("ru-RU"), icon: "Unlock" },
              { label: "Складов", value: items.length, icon: "Warehouse" },
            ].map((s, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name={s.icon} size={16} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-3xl font-bold font-mono">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            {items.map((w, i) => {
              const fill = Number(w.fill || 0);
              return (
                <div key={i} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                        <Icon name="Warehouse" size={18} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{w.warehouse}</p>
                        <p className="text-xs text-muted-foreground">Заполненность: {fill}%</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div><p className="text-xs text-muted-foreground">Всего</p><p className="font-bold font-mono">{Number(w.total || 0).toLocaleString("ru-RU")}</p></div>
                      <div><p className="text-xs text-muted-foreground">Резерв</p><p className="font-bold font-mono text-amber-600">{Number(w.reserved || 0).toLocaleString("ru-RU")}</p></div>
                      <div><p className="text-xs text-muted-foreground">Свободно</p><p className="font-bold font-mono text-emerald-600">{Number(w.available || 0).toLocaleString("ru-RU")}</p></div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${fill >= 85 ? "bg-red-400" : fill >= 60 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(fill, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// --- INVOICES ---
function InvoicesView() {
  const [items, setItems] = useState<Invoice[]>(EMPTY_INVOICES);
  const [search, setSearch] = useState("");
  const { ref, handle } = useExcelImport<Invoice>((rows) => setItems(rows));
  const doExport = () => exportToExcel(items, "накладные");

  const filtered = items.filter(i =>
    !search || i.number?.toLowerCase().includes(search.toLowerCase()) || i.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Накладные</h2>
          <p className="text-muted-foreground text-sm mt-1">{items.length} документов</p>
        </div>
        <ExcelToolbar onExport={doExport} onImportRef={ref} onImportHandle={handle} label="Скачать Excel" />
      </div>

      {items.length === 0 ? <EmptyState onImport={() => ref.current?.click()} /> : (
        <>
          <div className="relative mb-4">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по номеру или контрагенту..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Номер</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Дата</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Контрагент</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Тип</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Сумма</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Ничего не найдено</td></tr>
                  ) : filtered.map((inv, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="px-5 py-4 font-mono text-sm text-primary font-medium">{inv.number}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{inv.date}</td>
                      <td className="px-5 py-4 text-sm font-medium">{inv.supplier}</td>
                      <td className="px-5 py-4 text-center"><StatusBadge status={inv.type} /></td>
                      <td className="px-5 py-4 text-right text-sm font-bold font-mono">{inv.amount}</td>
                      <td className="px-5 py-4 text-center"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- DEFECTS ---
function DefectsView() {
  const [items, setItems] = useState<Defect[]>(EMPTY_DEFECTS);
  const { ref, handle } = useExcelImport<Defect>((rows) => setItems(rows));
  const doExport = () => exportToExcel(items, "брак");

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Брак</h2>
          <p className="text-muted-foreground text-sm mt-1">{items.length} записей</p>
        </div>
        <ExcelToolbar onExport={doExport} onImportRef={ref} onImportHandle={handle} label="Скачать Excel" />
      </div>

      {items.length === 0 ? <EmptyState onImport={() => ref.current?.click()} /> : (
        <div className="grid gap-4">
          {items.map((d, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 hover:border-red-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="AlertTriangle" size={18} className="text-red-500" />
                  </div>
                  <div>
                    {d.date && <p className="text-xs text-muted-foreground mb-1">{d.date}</p>}
                    <p className="font-semibold text-sm mb-1">{d.product}</p>
                    <p className="text-sm text-muted-foreground">{d.reason}</p>
                    {d.responsible && <p className="text-xs text-muted-foreground mt-1">Ответственный: {d.responsible}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={d.status} />
                  <span className="font-mono text-sm font-bold text-red-600">{d.qty} шт.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- ORDERS ---
function OrdersView() {
  const [items, setItems] = useState<Order[]>(EMPTY_ORDERS);
  const [search, setSearch] = useState("");
  const { ref, handle } = useExcelImport<Order>((rows) => setItems(rows));
  const doExport = () => exportToExcel(items, "заказы");

  const filtered = items.filter(i =>
    !search || i.client?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmt = items.reduce((s, o) => {
    const n = parseFloat(String(o.amount || "").replace(/[^\d.]/g, "")) || 0;
    return s + n;
  }, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Заказы в работе / Новинки</h2>
          <p className="text-muted-foreground text-sm mt-1">{items.length} заказов</p>
        </div>
        <ExcelToolbar onExport={doExport} onImportRef={ref} onImportHandle={handle} label="Скачать Excel" />
      </div>

      {items.length === 0 ? <EmptyState onImport={() => ref.current?.click()} /> : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "Новых", value: items.filter(o => o.status === "Новый" || o.status === "Новинка").length, color: "text-blue-600" },
              { label: "В работе", value: items.filter(o => o.status === "В работе" || o.status === "Комплектация").length, color: "text-indigo-600" },
              { label: "На сумму", value: totalAmt.toLocaleString("ru-RU") + " ₽", color: "text-emerald-600" },
            ].map((s, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 text-center">
                <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="relative mb-4">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по клиенту..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Клиент</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Позиций</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Сумма</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Дата</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Приоритет</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Ничего не найдено</td></tr>
                  ) : filtered.map((o, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="px-5 py-4 text-sm font-medium">{o.client}</td>
                      <td className="px-5 py-4 text-center text-sm font-mono">{o.items}</td>
                      <td className="px-5 py-4 text-right text-sm font-bold font-mono">{o.amount}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{o.date}</td>
                      <td className="px-5 py-4 text-center"><StatusBadge status={o.priority} /></td>
                      <td className="px-5 py-4 text-center"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- REPORTS ---
function ReportsView() {
  const [items, setItems] = useState<object[]>([]);
  const { ref, handle } = useExcelImport<object>((rows) => setItems(rows));
  const doExport = () => exportToExcel(items, "отчётность");

  const months = ["Ноя", "Дек", "Янв", "Фев", "Мар", "Апр"];
  const values = [820, 1100, 950, 1350, 1200, 1480];
  const maxVal = Math.max(...values);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Отчётность</h2>
          <p className="text-muted-foreground text-sm mt-1">Данные за последние 6 месяцев</p>
        </div>
        <ExcelToolbar onExport={doExport} onImportRef={ref} onImportHandle={handle} label="Скачать Excel" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Выручка (апр)", value: "—", change: "", up: true },
          { label: "Отгружено единиц", value: "—", change: "", up: true },
          { label: "Средний чек", value: "—", change: "", up: true },
          { label: "Возвратов", value: "—", change: "", up: true },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className="text-xl font-bold font-mono mb-1">{s.value}</p>
            <span className="text-xs text-muted-foreground">Загрузите отчёт для данных</span>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {Object.keys(items[0]).map(k => (
                    <th key={k} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    {Object.values(row as Record<string, unknown>).map((v, j) => (
                      <td key={j} className="px-5 py-3.5 text-sm">{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6">
        <p className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wide">Отгрузки по месяцам (тыс. ₽)</p>
        <div className="flex items-end gap-3 h-48">
          {months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{values[i]}</span>
              <div className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer" style={{ height: `${(values[i] / maxVal) * 160}px` }} />
              <span className="text-xs text-muted-foreground">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- IDEAS ---
function IdeasView() {
  const [items, setItems] = useState<Idea[]>(EMPTY_IDEAS);
  const { ref, handle } = useExcelImport<Idea>((rows) => setItems(rows));
  const doExport = () => exportToExcel(items, "идеи");

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Идеи</h2>
          <p className="text-muted-foreground text-sm mt-1">Копилка предложений команды</p>
        </div>
        <ExcelToolbar onExport={doExport} onImportRef={ref} onImportHandle={handle} label="Скачать Excel" />
      </div>

      {items.length === 0 ? <EmptyState onImport={() => ref.current?.click()} /> : (
        <div className="grid gap-3">
          {items.map((idea, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 flex items-center justify-between gap-4 hover:border-purple-200 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-0.5 w-12 flex-shrink-0">
                  <Icon name="ChevronUp" size={18} className="text-muted-foreground group-hover:text-purple-500 transition-colors" />
                  <span className="font-bold font-mono text-lg leading-tight">{idea.votes}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{idea.title}</p>
                  {idea.date && <p className="text-xs text-muted-foreground mt-0.5">{idea.date}</p>}
                </div>
              </div>
              <StatusBadge status={idea.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- MAIN ---
export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>("catalog");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "catalog": return <CatalogView />;
      case "stock": return <StockView />;
      case "invoices": return <InvoicesView />;
      case "defects": return <DefectsView />;
      case "orders": return <OrdersView />;
      case "reports": return <ReportsView />;
      case "ideas": return <IdeasView />;
    }
  };

  const activeNav = NAV_ITEMS.find(n => n.id === activeSection);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: "hsl(var(--sidebar-bg))" }}
      >
        <div className="px-6 py-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="LayoutGrid" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">Управление</p>
              <p className="text-xs" style={{ color: "hsl(var(--sidebar-fg))", opacity: 0.6 }}>складом и заказами</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${isActive ? "bg-primary text-white" : "hover:bg-white/10"}`}
                style={!isActive ? { color: "hsl(var(--sidebar-fg))" } : undefined}
              >
                <Icon name={item.icon} size={18} className={isActive ? "text-white" : item.color} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(221 70% 52% / 0.3)" }}>
              <Icon name="User" size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Администратор</p>
              <p className="text-xs" style={{ color: "hsl(var(--sidebar-fg))", opacity: 0.5 }}>Полный доступ</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setSidebarOpen(true)}>
              <Icon name="Menu" size={20} />
            </button>
            <div>
              <p className="font-semibold text-sm">{activeNav?.label}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">06 мая 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
              <Icon name="Bell" size={18} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
