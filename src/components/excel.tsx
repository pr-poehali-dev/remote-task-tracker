import { useRef } from "react";
import * as XLSX from "xlsx";
import Icon from "@/components/ui/icon";

export type Section = "catalog" | "stock" | "invoices" | "defects" | "orders" | "reports" | "ideas";

export type CatalogItem = { name: string; category: string; price: number; stock: number; status: string };
export type StockItem = { warehouse: string; total: number; reserved: number; available: number; fill: number };
export type Invoice = { number: string; date: string; supplier: string; amount: string; status: string; type: string };
export type Defect = { product: string; qty: number; date: string; reason: string; responsible: string; status: string };
export type Order = { client: string; items: number; amount: string; date: string; status: string; priority: string };
export type Idea = { id: number; title: string; votes: number; status: string; date: string };

export const NAV_ITEMS = [
  { id: "catalog" as Section, label: "Каталог товаров", icon: "Package", color: "text-blue-400" },
  { id: "stock" as Section, label: "Остатки на складах", icon: "Warehouse", color: "text-teal-400" },
  { id: "invoices" as Section, label: "Накладные", icon: "FileText", color: "text-indigo-400" },
  { id: "defects" as Section, label: "Брак", icon: "AlertTriangle", color: "text-red-400" },
  { id: "orders" as Section, label: "Заказы / Новинки", icon: "ShoppingCart", color: "text-amber-400" },
  { id: "reports" as Section, label: "Отчётность", icon: "BarChart2", color: "text-emerald-400" },
  { id: "ideas" as Section, label: "Идеи", icon: "Lightbulb", color: "text-purple-400" },
];

export function exportToExcel(data: object[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Лист1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function useExcelImport<T>(onImport: (rows: T[]) => void) {
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

export function StatusBadge({ status }: { status: string }) {
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

export function ExcelToolbar({ onExport, onImportRef, onImportHandle, label }: {
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

export function EmptyState({ onImport }: { onImport: () => void }) {
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
