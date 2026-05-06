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
type IdeaPhoto = { id: number; src: string; comment: string };

type IdeaCard = {
  id: number;
  title: string;
  status: string;
  date: string;
  votes: number;
  photos: IdeaPhoto[];
};

function IdeaCardView({ card, onDelete, onUpdate }: {
  card: IdeaCard;
  onDelete: () => void;
  onUpdate: (updated: IdeaCard) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [commentDraft, setCommentDraft] = useState<Record<number, string>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const newPhoto: IdeaPhoto = { id: Date.now() + Math.random(), src: ev.target?.result as string, comment: "" };
        onUpdate({ ...card, photos: [...card.photos, newPhoto] });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const updatePhotoComment = (photoId: number, comment: string) => {
    onUpdate({ ...card, photos: card.photos.map(p => p.id === photoId ? { ...p, comment } : p) });
  };

  const deletePhoto = (photoId: number) => {
    onUpdate({ ...card, photos: card.photos.filter(p => p.id !== photoId) });
  };

  const vote = (delta: number) => {
    onUpdate({ ...card, votes: Math.max(0, card.votes + delta) });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden transition-all">
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Votes */}
        <div className="flex flex-col items-center gap-0.5 w-10 flex-shrink-0">
          <button onClick={() => vote(1)} className="text-muted-foreground hover:text-purple-500 transition-colors">
            <Icon name="ChevronUp" size={18} />
          </button>
          <span className="font-bold font-mono text-base leading-tight">{card.votes}</span>
          <button onClick={() => vote(-1)} className="text-muted-foreground hover:text-red-400 transition-colors">
            <Icon name="ChevronDown" size={16} />
          </button>
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{card.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {card.date && <span className="text-xs text-muted-foreground">{card.date}</span>}
            {card.photos.length > 0 && (
              <span className="text-xs text-muted-foreground">· {card.photos.length} фото</span>
            )}
          </div>
        </div>

        <StatusBadge status={card.status} />

        <button
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={16} />
        </button>

        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
        >
          <Icon name="Trash2" size={14} />
        </button>
      </div>

      {/* Expanded: photos + comments */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />

          {/* Photo grid */}
          {card.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {card.photos.map(photo => (
                <div key={photo.id} className="space-y-1.5">
                  <div className="relative rounded-xl overflow-hidden border border-border group aspect-square bg-muted">
                    <img src={photo.src} className="w-full h-full object-cover" />
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="X" size={11} />
                    </button>
                  </div>
                  <textarea
                    value={commentDraft[photo.id] ?? photo.comment}
                    onChange={e => setCommentDraft(prev => ({ ...prev, [photo.id]: e.target.value }))}
                    onBlur={() => {
                      updatePhotoComment(photo.id, commentDraft[photo.id] ?? photo.comment);
                    }}
                    placeholder="Комментарий к фото..."
                    rows={2}
                    className="w-full text-xs px-2.5 py-1.5 border border-border rounded-lg bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add photo button */}
          <button
            onClick={() => photoRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors w-full justify-center"
          >
            <Icon name="ImagePlus" size={16} />
            Добавить фото
          </button>
        </div>
      )}
    </div>
  );
}

export function IdeasView() {
  const [cards, setCards] = useState<IdeaCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Идея");
  const [date, setDate] = useState("");

  const addCard = () => {
    if (!title.trim()) return;
    const card: IdeaCard = {
      id: Date.now(),
      title: title.trim(),
      status,
      date,
      votes: 0,
      photos: [],
    };
    setCards(prev => [card, ...prev]);
    setTitle(""); setStatus("Идея"); setDate("");
    setShowForm(false);
  };

  const updateCard = (id: number, updated: IdeaCard) => {
    setCards(prev => prev.map(c => c.id === id ? updated : c));
  };

  const deleteCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Идеи</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {cards.length > 0 ? `${cards.length} идей · ${cards.reduce((s, c) => s + c.photos.length, 0)} фото` : "Копилка предложений команды"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name={showForm ? "X" : "Plus"} size={15} />
          {showForm ? "Отмена" : "Новая идея"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 mb-5 space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Название идеи *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Опишите идею..."
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                onKeyDown={e => e.key === "Enter" && addCard()}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Статус</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              >
                {["Идея", "Обсуждение", "В плане", "Реализовано"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Дата</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              />
            </div>
            <button
              onClick={addCard}
              disabled={!title.trim()}
              className="mt-5 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
            <Icon name="Lightbulb" size={28} className="text-purple-400" />
          </div>
          <p className="font-semibold text-foreground mb-1">Нет идей</p>
          <p className="text-sm text-muted-foreground mb-4">Нажмите «Новая идея», чтобы добавить первую</p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="Plus" size={15} />
            Новая идея
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {cards.sort((a, b) => b.votes - a.votes).map(card => (
            <IdeaCardView
              key={card.id}
              card={card}
              onDelete={() => deleteCard(card.id)}
              onUpdate={updated => updateCard(card.id, updated)}
            />
          ))}
        </div>
      )}
    </div>
  );
}