import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  exportToExcel, useExcelImport,
  StatusBadge, ExcelToolbar, EmptyState,
  type CatalogItem, type StockItem, type Invoice,
} from "@/components/excel";

// --- CATALOG ---
function PhotoCell({ photo, onChange }: { photo?: string; onChange: (src: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return (
    <div className="flex items-center justify-center">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {photo ? (
        <button onClick={() => inputRef.current?.click()} className="block w-10 h-10 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity">
          <img src={photo} className="w-full h-full object-cover" />
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-10 h-10 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Icon name="ImagePlus" size={15} />
        </button>
      )}
    </div>
  );
}

function EditableCell({
  value, onChange, mono, align, placeholder,
}: {
  value?: string | number;
  onChange: (v: string) => void;
  mono?: boolean;
  align?: "left" | "right" | "center";
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));

  const commit = () => { onChange(draft); setEditing(false); };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className={`w-full min-w-[80px] px-2 py-1 text-sm border border-primary/50 rounded bg-card focus:outline-none ${mono ? "font-mono" : ""} text-${align ?? "left"}`}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value ?? "")); setEditing(true); }}
      className={`w-full text-sm px-1 py-0.5 rounded hover:bg-muted/50 transition-colors text-left ${mono ? "font-mono" : ""} ${!value ? "text-muted-foreground/40 italic" : ""}`}
    >
      {value || placeholder || "—"}
    </button>
  );
}

export function CatalogView() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [statusFilter, setStatusFilter] = useState("Все");

  const { ref, handle } = useExcelImport<CatalogItem>((rows) => setItems(rows));

  const updateItem = useCallback((index: number, field: keyof CatalogItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const updatePhoto = useCallback((index: number, src: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, photo: src } : item));
  }, []);

  const addRow = () => {
    setItems(prev => [...prev, { name: "Новый товар", category: "", price: 0, stock: 0, status: "В наличии" }]);
  };

  const deleteRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const categories = ["Все", ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];
  const statuses = ["Все", "В наличии", "Мало", "Нет"];

  const filtered = items.map((item, originalIndex) => ({ item, originalIndex })).filter(({ item }) => {
    const matchSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase())
      || item.sellerArticle?.toLowerCase().includes(search.toLowerCase())
      || item.wbArticle?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Все" || item.category === category;
    const matchStatus = statusFilter === "Все" || item.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const total = items.length;
  const inStock = items.filter(i => i.status === "В наличии").length;
  const outOfStock = items.filter(i => i.status === "Нет").length;

  const doExport = () => exportToExcel(items.map(({ photo: _p, ...rest }) => rest), "каталог_товаров");

  const TH = ({ children, align = "left" }: { children: React.ReactNode; align?: string }) => (
    <th className={`px-3 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap text-${align}`}>
      {children}
    </th>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Каталог товаров</h2>
          <p className="text-muted-foreground text-sm mt-1">{total} позиций</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="Plus" size={15} />
            Добавить строку
          </button>
          <ExcelToolbar onExport={doExport} onImportRef={ref} onImportHandle={handle} label="Скачать Excel" />
        </div>
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
                placeholder="Поиск по названию, артикулу..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Icon name="FileSpreadsheet" size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">Нет данных</p>
          <p className="text-sm text-muted-foreground mb-4">Загрузите файл Excel или добавьте товар вручную</p>
          <div className="flex gap-2">
            <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Icon name="Plus" size={15} />
              Добавить товар
            </button>
            <button onClick={() => ref.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
              <Icon name="Upload" size={15} />
              Загрузить Excel
            </button>
          </div>
          <input ref={ref} type="file" accept=".xlsx,.xls" className="hidden" onChange={handle} />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <TH align="center">Фото</TH>
                  <TH>Наименование</TH>
                  <TH>Арт. продавца</TH>
                  <TH>Арт. WB</TH>
                  <TH>Размер</TH>
                  <TH>Баркод</TH>
                  <TH>Категория</TH>
                  <TH align="right">Цена</TH>
                  <TH align="right">Остаток</TH>
                  <TH align="center">Статус</TH>
                  <TH>Реклама</TH>
                  <TH>Комментарий</TH>
                  <TH align="center"></TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-10 text-muted-foreground text-sm">Ничего не найдено</td></tr>
                ) : filtered.map(({ item, originalIndex }) => (
                  <tr key={originalIndex} className="hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-3">
                      <PhotoCell photo={item.photo} onChange={src => updatePhoto(originalIndex, src)} />
                    </td>
                    <td className="px-3 py-3 min-w-[160px]">
                      <EditableCell value={item.name} onChange={v => updateItem(originalIndex, "name", v)} placeholder="Название" />
                    </td>
                    <td className="px-3 py-3 min-w-[110px]">
                      <EditableCell value={item.sellerArticle} onChange={v => updateItem(originalIndex, "sellerArticle", v)} mono placeholder="—" />
                    </td>
                    <td className="px-3 py-3 min-w-[110px]">
                      <EditableCell value={item.wbArticle} onChange={v => updateItem(originalIndex, "wbArticle", v)} mono placeholder="—" />
                    </td>
                    <td className="px-3 py-3 min-w-[80px]">
                      <EditableCell value={item.size} onChange={v => updateItem(originalIndex, "size", v)} placeholder="—" />
                    </td>
                    <td className="px-3 py-3 min-w-[120px]">
                      <EditableCell value={item.barcode} onChange={v => updateItem(originalIndex, "barcode", v)} mono placeholder="—" />
                    </td>
                    <td className="px-3 py-3 min-w-[110px]">
                      <EditableCell value={item.category} onChange={v => updateItem(originalIndex, "category", v)} placeholder="—" />
                    </td>
                    <td className="px-3 py-3 min-w-[90px] text-right">
                      <EditableCell value={item.price} onChange={v => updateItem(originalIndex, "price", v)} mono align="right" placeholder="0" />
                    </td>
                    <td className="px-3 py-3 min-w-[80px] text-right">
                      <EditableCell value={item.stock} onChange={v => updateItem(originalIndex, "stock", v)} mono align="right" placeholder="0" />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <select
                        value={item.status}
                        onChange={e => updateItem(originalIndex, "status", e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-card focus:outline-none focus:ring-1 focus:ring-primary/30"
                      >
                        {["В наличии", "Мало", "Нет"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3 min-w-[120px]">
                      <EditableCell value={item.ads} onChange={v => updateItem(originalIndex, "ads", v)} placeholder="—" />
                    </td>
                    <td className="px-3 py-3 min-w-[160px]">
                      <EditableCell value={item.comment} onChange={v => updateItem(originalIndex, "comment", v)} placeholder="—" />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => deleteRow(originalIndex)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Icon name="Trash2" size={13} />
                      </button>
                    </td>
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