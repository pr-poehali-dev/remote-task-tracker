import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  exportToExcel, useExcelImport,
  StatusBadge, ExcelToolbar, EmptyState,
  type Defect, type Order, type Idea,
} from "@/components/excel";

// --- DEFECTS ---
export function DefectsView() {
  const [items, setItems] = useState<Defect[]>([]);
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
export function OrdersView() {
  const [items, setItems] = useState<Order[]>([]);
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
export function ReportsView() {
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
          { label: "Выручка (апр)", value: "—" },
          { label: "Отгружено единиц", value: "—" },
          { label: "Средний чек", value: "—" },
          { label: "Возвратов", value: "—" },
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
export function IdeasView() {
  const [items, setItems] = useState<Idea[]>([]);
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
