import { useState, useRef } from "react";
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
type ReportSubSection = "daily" | "extra" | "monthly";

type ReportEntry = {
  id: number;
  title: string;
  date: string;
  tableUrl: string;
  photos: string[];
};

function useReportSection(storageKey: string) {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tableUrl, setTableUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPhotos(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    const entry: ReportEntry = {
      id: Date.now(),
      title: title.trim(),
      date,
      tableUrl: tableUrl.trim(),
      photos: [...photos],
    };
    setEntries(prev => [entry, ...prev]);
    setTitle(""); setDate(""); setTableUrl(""); setPhotos([]);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return { entries, showForm, setShowForm, title, setTitle, date, setDate, tableUrl, setTableUrl, photos, setPhotos, photoRef, handlePhotoUpload, handleAdd, handleDelete };
}

function ReportSubPanel({ label, color }: { label: string; color: string }) {
  const s = useReportSection(label);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className={`px-5 py-4 border-b border-border flex items-center justify-between ${color}`}>
        <p className="font-semibold text-sm">{label}</p>
        <button
          onClick={() => s.setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
        >
          <Icon name={s.showForm ? "X" : "Plus"} size={13} />
          {s.showForm ? "Отмена" : "Добавить"}
        </button>
      </div>

      {s.showForm && (
        <div className="px-5 py-4 border-b border-border bg-muted/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Название отчёта *</label>
              <input
                value={s.title}
                onChange={e => s.setTitle(e.target.value)}
                placeholder="Введите название..."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Дата</label>
              <input
                type="date"
                value={s.date}
                onChange={e => s.setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ссылка на таблицу (Google Sheets, Excel Online и т.д.)</label>
            <input
              value={s.tableUrl}
              onChange={e => s.setTableUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Фотографии</label>
            <input ref={s.photoRef} type="file" accept="image/*" multiple className="hidden" onChange={s.handlePhotoUpload} />
            <button
              onClick={() => s.photoRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/40 transition-colors w-full justify-center"
            >
              <Icon name="ImagePlus" size={15} />
              Добавить фото
            </button>
            {s.photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {s.photos.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                    <img src={src} className="w-full h-full object-cover" />
                    <button
                      onClick={() => s.setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Icon name="X" size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={s.handleAdd}
            disabled={!s.title.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Сохранить отчёт
          </button>
        </div>
      )}

      {s.entries.length === 0 && !s.showForm ? (
        <div className="py-10 text-center text-muted-foreground text-sm">
          Нет отчётов — нажмите «Добавить»
        </div>
      ) : (
        <div className="divide-y divide-border">
          {s.entries.map(entry => (
            <div key={entry.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{entry.title}</p>
                    {entry.date && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">{entry.date}</span>
                    )}
                  </div>
                  {entry.tableUrl && (
                    <a
                      href={entry.tableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Icon name="ExternalLink" size={12} />
                      Открыть таблицу
                    </a>
                  )}
                  {entry.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.photos.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                          <img src={src} className="w-14 h-14 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => s.handleDelete(entry.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors flex-shrink-0"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportsView() {
  const [sub, setSub] = useState<ReportSubSection>("daily");

  const tabs: { id: ReportSubSection; label: string; icon: string; color: string; panelColor: string }[] = [
    { id: "daily", label: "Ежедневные отчёты", icon: "CalendarCheck", color: "text-blue-600", panelColor: "bg-blue-50/60 text-blue-700" },
    { id: "extra", label: "Дополнительные отчёты", icon: "FilePlus", color: "text-emerald-600", panelColor: "bg-emerald-50/60 text-emerald-700" },
    { id: "monthly", label: "Ежемесячные отчёты", icon: "CalendarDays", color: "text-purple-600", panelColor: "bg-purple-50/60 text-purple-700" },
  ];

  const active = tabs.find(t => t.id === sub)!;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Отчётность</h2>
        <p className="text-muted-foreground text-sm mt-1">Управление отчётами по подразделам</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              sub === t.id
                ? `border-primary ${t.color}`
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <ReportSubPanel key={sub} label={active.label} color={active.panelColor} />
    </div>
  );
}

// --- IDEAS ---
type IdeaEntry = {
  id: number;
  src: string;
  description: string;
  createdAt: string;
};

export function IdeasView() {
  const [entries, setEntries] = useState<IdeaEntry[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<{ src: string; description: string }[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFiles = (files: File[]) => {
    files.filter(f => f.type.startsWith("image/")).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPendingPhotos(prev => [...prev, { src: ev.target?.result as string, description: "" }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    readFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    readFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const removePending = (i: number) => {
    setPendingPhotos(prev => prev.filter((_, j) => j !== i));
  };

  const updateDesc = (i: number, val: string) => {
    setPendingPhotos(prev => prev.map((p, j) => j === i ? { ...p, description: val } : p));
  };

  const saveAll = () => {
    if (pendingPhotos.length === 0) return;
    const now = new Date().toLocaleDateString("ru-RU");
    const newEntries: IdeaEntry[] = pendingPhotos.map(p => ({
      id: Date.now() + Math.random(),
      src: p.src,
      description: p.description,
      createdAt: now,
    }));
    setEntries(prev => [...newEntries.reverse(), ...prev]);
    setPendingPhotos([]);
  };

  const deleteEntry = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntryDesc = (id: number, description: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, description } : e));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Идеи</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {entries.length > 0 ? `${entries.length} идей` : "Загрузите фото — добавьте описание"}
          </p>
        </div>
      </div>

      {/* Drop zone / upload area */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileRef.current?.click()}
        className="relative border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50/70 rounded-2xl p-10 mb-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
        <div className="w-14 h-14 rounded-2xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
          <Icon name="ImagePlus" size={26} className="text-purple-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm text-foreground">Нажмите или перетащите фото</p>
          <p className="text-xs text-muted-foreground mt-0.5">Любое количество изображений сразу</p>
        </div>
      </div>

      {/* Pending: preview + description before save */}
      {pendingPhotos.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-5 space-y-4 animate-fade-in">
          <p className="text-sm font-semibold text-foreground">
            Добавлено {pendingPhotos.length} фото — введите описания и сохраните
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingPhotos.map((p, i) => (
              <div key={i} className="flex gap-3 bg-muted/30 rounded-xl p-3">
                <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border group">
                  <img src={p.src} className="w-full h-full object-cover" />
                  <button
                    onClick={e => { e.stopPropagation(); removePending(i); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="X" size={10} />
                  </button>
                </div>
                <textarea
                  value={p.description}
                  onChange={e => updateDesc(i, e.target.value)}
                  placeholder="Описание идеи..."
                  rows={3}
                  className="flex-1 text-sm px-3 py-2 border border-border rounded-xl bg-card resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/40 placeholder:text-muted-foreground/50"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveAll}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Сохранить {pendingPhotos.length > 1 ? `все ${pendingPhotos.length}` : ""}
            </button>
            <button
              onClick={() => setPendingPhotos([])}
              className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
      )}

      {/* Saved entries */}
      {entries.length === 0 && pendingPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Icon name="Lightbulb" size={32} className="text-purple-300 mb-3" />
          <p className="text-sm">Загрузите первое фото с идеей</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-purple-200 transition-colors">
              <div className="relative aspect-[4/3] bg-muted cursor-zoom-in" onClick={() => setLightbox(entry.src)}>
                <img src={entry.src} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <button
                  onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <Icon name="Trash2" size={13} />
                </button>
                {entry.createdAt && (
                  <span className="absolute bottom-2 left-2 text-xs text-white/80 bg-black/40 rounded px-1.5 py-0.5">{entry.createdAt}</span>
                )}
              </div>
              <div className="p-3">
                <textarea
                  value={entry.description}
                  onChange={e => updateEntryDesc(entry.id, e.target.value)}
                  placeholder="Описание идеи..."
                  rows={2}
                  className="w-full text-sm px-0 py-0 border-none bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/40 text-foreground"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}