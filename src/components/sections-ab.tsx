import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  exportToExcel, useExcelImport,
  StatusBadge, ExcelToolbar, EmptyState,
  type CatalogItem, type StockItem, type Invoice,
} from "@/components/excel";

// --- CATALOG ---
export function CatalogView() {
  const [items, setItems] = useState<CatalogItem[]>([]);
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
export function StockView() {
  const [items, setItems] = useState<StockItem[]>([]);
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
export function InvoicesView() {
  const [items, setItems] = useState<Invoice[]>([]);
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
