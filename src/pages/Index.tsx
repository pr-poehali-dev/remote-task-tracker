import { useState } from "react";
import Icon from "@/components/ui/icon";
import { NAV_ITEMS, type Section } from "@/components/excel";
import { CatalogView, StockView, InvoicesView } from "@/components/sections-ab";
import { DefectsView, OrdersView, ReportsView, IdeasView } from "@/components/sections-cd";

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
