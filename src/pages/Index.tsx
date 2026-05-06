import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section =
  | "catalog"
  | "stock"
  | "invoices"
  | "defects"
  | "orders"
  | "reports"
  | "ideas";

const NAV_ITEMS = [
  { id: "catalog" as Section, label: "Каталог товаров", icon: "Package", color: "text-blue-400" },
  { id: "stock" as Section, label: "Остатки на складах", icon: "Warehouse", color: "text-teal-400" },
  { id: "invoices" as Section, label: "Накладные", icon: "FileText", color: "text-indigo-400" },
  { id: "defects" as Section, label: "Брак", icon: "AlertTriangle", color: "text-red-400" },
  { id: "orders" as Section, label: "Заказы / Новинки", icon: "ShoppingCart", color: "text-amber-400" },
  { id: "reports" as Section, label: "Отчётность", icon: "BarChart2", color: "text-emerald-400" },
  { id: "ideas" as Section, label: "Идеи", icon: "Lightbulb", color: "text-purple-400" },
];

const catalogItems = [
  { id: "A-1201", name: "Кресло офисное Comfort Pro", category: "Мебель", price: 12500, stock: 48, status: "В наличии" },
  { id: "B-0034", name: "Стол переговорный 200×90", category: "Мебель", price: 28900, stock: 12, status: "В наличии" },
  { id: "C-0711", name: "Монитор 27\" IPS 4K", category: "Электроника", price: 41200, stock: 5, status: "Мало" },
  { id: "D-1005", name: "Шкаф архивный металлический", category: "Хранение", price: 7800, stock: 0, status: "Нет" },
  { id: "E-0289", name: "Ноутбук бизнес-серии", category: "Электроника", price: 89000, stock: 23, status: "В наличии" },
  { id: "F-0422", name: "IP-камера HD 2MP", category: "Безопасность", price: 3200, stock: 67, status: "В наличии" },
];

const stockItems = [
  { warehouse: "Склад №1 (Москва)", total: 1248, reserved: 312, available: 936, fill: 75 },
  { warehouse: "Склад №2 (Подольск)", total: 654, reserved: 88, available: 566, fill: 50 },
  { warehouse: "Склад №3 (Химки)", total: 2100, reserved: 890, available: 1210, fill: 90 },
  { warehouse: "Склад №4 (Балашиха)", total: 430, reserved: 40, available: 390, fill: 30 },
];

const invoices = [
  { number: "НК-2024-0381", date: "03.05.2026", supplier: "ООО «ТехПоставка»", amount: "284 500 ₽", status: "Проведена", type: "Приход" },
  { number: "НК-2024-0380", date: "01.05.2026", supplier: "ИП Смирнов А.В.", amount: "47 200 ₽", status: "На проверке", type: "Возврат" },
  { number: "НК-2024-0379", date: "29.04.2026", supplier: "ООО «МегаГрупп»", amount: "1 205 000 ₽", status: "Проведена", type: "Приход" },
  { number: "НК-2024-0378", date: "28.04.2026", supplier: "ООО «Альфа»", amount: "63 800 ₽", status: "Отклонена", type: "Расход" },
  { number: "НК-2024-0377", date: "25.04.2026", supplier: "ЗАО «КомплектСтрой»", amount: "524 100 ₽", status: "Проведена", type: "Приход" },
];

const defects = [
  { id: "BR-0091", product: "Кресло офисное Comfort Pro", qty: 3, date: "04.05.2026", reason: "Механическое повреждение", responsible: "Иванов И.И.", status: "На списание" },
  { id: "BR-0090", product: "Монитор 27\" IPS 4K", qty: 1, date: "02.05.2026", reason: "Битая матрица", responsible: "Петров С.А.", status: "Возврат поставщику" },
  { id: "BR-0089", product: "IP-камера HD 2MP", qty: 5, date: "30.04.2026", reason: "Заводской брак", responsible: "Сидорова М.В.", status: "Возврат поставщику" },
  { id: "BR-0088", product: "Шкаф архивный", qty: 2, date: "28.04.2026", reason: "Вмятины при доставке", responsible: "Козлов Р.П.", status: "Списано" },
];

const orders = [
  { id: "ЗК-5521", client: "ОАО «Строймонтаж»", items: 14, amount: "347 000 ₽", date: "06.05.2026", status: "Новый", priority: "Высокий" },
  { id: "ЗК-5520", client: "ООО «РегионСервис»", items: 3, amount: "89 500 ₽", date: "05.05.2026", status: "В работе", priority: "Средний" },
  { id: "ЗК-5519", client: "ИП Волков Д.К.", items: 7, amount: "125 200 ₽", date: "05.05.2026", status: "В работе", priority: "Высокий" },
  { id: "ЗК-5518", client: "ООО «НовоТех»", items: 21, amount: "890 000 ₽", date: "04.05.2026", status: "Комплектация", priority: "Средний" },
  { id: "ЗК-НОВИНКА", client: "ЗАО «МегаПлюс»", items: 2, amount: "45 000 ₽", date: "06.05.2026", status: "Новинка", priority: "Новинка" },
];

const ideas = [
  { id: 1, title: "Автоматические уведомления о низком остатке", votes: 12, status: "В плане", date: "01.05.2026" },
  { id: 2, title: "Интеграция с 1С для синхронизации накладных", votes: 28, status: "Обсуждение", date: "25.04.2026" },
  { id: 3, title: "Мобильное приложение для кладовщиков", votes: 35, status: "В плане", date: "20.04.2026" },
  { id: 4, title: "QR-коды на товарных позициях", votes: 19, status: "Реализовано", date: "10.04.2026" },
  { id: 5, title: "Аналитика сезонности продаж", votes: 8, status: "Идея", date: "05.05.2026" },
];

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
    "Новинка-приоритет": "bg-pink-100 text-pink-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function CatalogView() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Каталог товаров</h2>
          <p className="text-muted-foreground text-sm mt-1">{catalogItems.length} позиций</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Icon name="Plus" size={16} />
          Добавить товар
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Всего позиций", value: "6", icon: "Package", color: "bg-blue-50 text-blue-600" },
          { label: "В наличии", value: "4", icon: "CheckCircle", color: "bg-emerald-50 text-emerald-600" },
          { label: "Нет в наличии", value: "1", icon: "XCircle", color: "bg-red-50 text-red-600" },
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
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Артикул</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Наименование</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Категория</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Цена</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Остаток</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {catalogItems.map((item, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-mono text-sm text-muted-foreground">{item.id}</td>
                  <td className="px-5 py-4 font-medium text-sm">{item.name}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{item.category}</td>
                  <td className="px-5 py-4 text-right text-sm font-medium">{item.price.toLocaleString("ru-RU")} ₽</td>
                  <td className="px-5 py-4 text-right text-sm font-mono">{item.stock}</td>
                  <td className="px-5 py-4 text-center"><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StockView() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Остатки на складах</h2>
          <p className="text-muted-foreground text-sm mt-1">Актуально на 06.05.2026</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Общий остаток", value: "4 432", icon: "Box" },
          { label: "Зарезервировано", value: "1 330", icon: "Lock" },
          { label: "Свободно", value: "3 102", icon: "Unlock" },
          { label: "Складов", value: "4", icon: "Warehouse" },
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
        {stockItems.map((w, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Icon name="Warehouse" size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{w.warehouse}</p>
                  <p className="text-xs text-muted-foreground">Заполненность: {w.fill}%</p>
                </div>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-xs text-muted-foreground">Всего</p>
                  <p className="font-bold font-mono">{w.total.toLocaleString("ru-RU")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Резерв</p>
                  <p className="font-bold font-mono text-amber-600">{w.reserved.toLocaleString("ru-RU")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Свободно</p>
                  <p className="font-bold font-mono text-emerald-600">{w.available.toLocaleString("ru-RU")}</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${w.fill >= 85 ? "bg-red-400" : w.fill >= 60 ? "bg-amber-400" : "bg-emerald-400"}`}
                style={{ width: `${w.fill}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoicesView() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Накладные</h2>
          <p className="text-muted-foreground text-sm mt-1">{invoices.length} документов</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Icon name="Plus" size={16} />
          Новая накладная
        </button>
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
              {invoices.map((inv, i) => (
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
    </div>
  );
}

function DefectsView() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Брак</h2>
          <p className="text-muted-foreground text-sm mt-1">{defects.length} записи</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Icon name="Plus" size={16} />
          Зафиксировать брак
        </button>
      </div>
      <div className="grid gap-4">
        {defects.map((d, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 hover:border-red-200 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="AlertTriangle" size={18} className="text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{d.date}</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">{d.product}</p>
                  <p className="text-sm text-muted-foreground">{d.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ответственный: {d.responsible}</p>
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
    </div>
  );
}

function OrdersView() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Заказы в работе / Новинки</h2>
          <p className="text-muted-foreground text-sm mt-1">{orders.length} заказов</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Icon name="Plus" size={16} />
          Новый заказ
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Новых", value: "2", color: "text-blue-600" },
          { label: "В работе", value: "2", color: "text-indigo-600" },
          { label: "На сумму", value: "1 496 700 ₽", color: "text-emerald-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 text-center">
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Заказ</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Клиент</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Позиций</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Сумма</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Приоритет</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-mono text-sm font-medium text-primary">{o.id}</td>
                  <td className="px-5 py-4 text-sm font-medium">{o.client}</td>
                  <td className="px-5 py-4 text-center text-sm font-mono">{o.items}</td>
                  <td className="px-5 py-4 text-right text-sm font-bold font-mono">{o.amount}</td>
                  <td className="px-5 py-4 text-center"><StatusBadge status={o.priority} /></td>
                  <td className="px-5 py-4 text-center"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportsView() {
  const months = ["Ноя", "Дек", "Янв", "Фев", "Мар", "Апр"];
  const values = [820, 1100, 950, 1350, 1200, 1480];
  const maxVal = Math.max(...values);
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Отчётность</h2>
          <p className="text-muted-foreground text-sm mt-1">Данные за последние 6 месяцев</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
          <Icon name="Download" size={16} />
          Экспорт
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Выручка (апр)", value: "1 480 000 ₽", change: "+23%", up: true },
          { label: "Отгружено единиц", value: "3 241", change: "+8%", up: true },
          { label: "Средний чек", value: "42 300 ₽", change: "-3%", up: false },
          { label: "Возвратов", value: "12", change: "-15%", up: true },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className="text-xl font-bold font-mono mb-1">{s.value}</p>
            <span className={`text-xs font-medium ${s.up ? "text-emerald-600" : "text-red-500"}`}>
              {s.change} к прошлому периоду
            </span>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <p className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-wide">Отгрузки по месяцам (тыс. ₽)</p>
        <div className="flex items-end gap-3 h-48">
          {months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{values[i]}</span>
              <div
                className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
                style={{ height: `${(values[i] / maxVal) * 160}px` }}
              />
              <span className="text-xs text-muted-foreground">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IdeasView() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Идеи</h2>
          <p className="text-muted-foreground text-sm mt-1">Копилка предложений команды</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Icon name="Plus" size={16} />
          Предложить идею
        </button>
      </div>
      <div className="grid gap-3">
        {ideas.map((idea, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 flex items-center justify-between gap-4 hover:border-purple-200 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-0.5 w-12 flex-shrink-0">
                <Icon name="ChevronUp" size={18} className="text-muted-foreground group-hover:text-purple-500 transition-colors" />
                <span className="font-bold font-mono text-lg leading-tight">{idea.votes}</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{idea.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{idea.date}</p>
              </div>
            </div>
            <StatusBadge status={idea.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

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
      {/* Sidebar */}
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
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
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
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Icon name="Search" size={18} className="text-muted-foreground" />
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
