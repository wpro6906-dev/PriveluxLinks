import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api-base";
import { useLocation } from "wouter";
import { Link2, User as UserIcon, Settings, LogOut, BarChart2 } from "lucide-react";
import logoPath from "@assets/image_1781908878316.png";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { LinksManager } from "@/components/admin/links-manager";
import { IdentityManager } from "@/components/admin/identity-manager";
import { SettingsManager } from "@/components/admin/settings-manager";
import { AnalyticsManager } from "@/components/admin/analytics-manager";

const USER_ME_KEY = ["user-auth", "me"];

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"links" | "identity" | "settings" | "analytics">("links");
  const [user, setUser] = useState<{ username: string } | null | undefined>(undefined);

  useEffect(() => {
    const cached = queryClient.getQueryData<{ username: string }>(USER_ME_KEY);
    if (cached) {
      setUser(cached);
      return;
    }
    const token = localStorage.getItem("auth_token");
    fetch(`${API_BASE}/api/user-auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then((data) => {
        queryClient.setQueryData(USER_ME_KEY, data);
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      });
  }, [queryClient]);

  useEffect(() => {
    if (user === null) {
      setLocation("/dashboard/login");
    }
  }, [user, setLocation]);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/user-auth/logout`, { method: "POST", credentials: "include" });
    queryClient.removeQueries({ queryKey: USER_ME_KEY });
    toast({ title: "Sesión cerrada", description: "Hasta pronto!" });
    setLocation("/dashboard/login");
  };

  if (user === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Cargando...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-background flex">
      <aside className="w-72 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-6 flex flex-col items-center border-b border-sidebar-border border-b-primary/20 relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary"></div>
          <img src={logoPath} alt="Logo" className="w-16 h-16 rounded-full mb-4 ring-2 ring-primary/20" />
          <h2 className="font-serif text-lg text-sidebar-foreground">Mi Dashboard</h2>
          <p className="text-muted-foreground text-xs mt-1">{user.username}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {(["links", "identity", "settings", "analytics"] as const).map((tab) => {
            const icons = {
              links: <Link2 className="w-5 h-5" />,
              identity: <UserIcon className="w-5 h-5" />,
              settings: <Settings className="w-5 h-5" />,
              analytics: <BarChart2 className="w-5 h-5" />,
            };
            const labels = {
              links: "Mis Links",
              identity: "Mi Identidad",
              settings: "Configuración",
              analytics: "Estadísticas",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === tab ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"}`}
              >
                {icons[tab]}
                <span className="font-medium">{labels[tab]}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-background/50 overflow-auto">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="font-serif text-lg">Mi Dashboard</h2>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="bg-transparent border border-border rounded p-2 text-sm"
          >
            <option value="links">Mis Links</option>
            <option value="identity">Mi Identidad</option>
            <option value="settings">Configuración</option>
            <option value="analytics">Estadísticas</option>
          </select>
        </header>

        <div className="p-6 md:p-10 max-w-4xl mx-auto">
          {activeTab === "links" && <LinksManager />}
          {activeTab === "identity" && <IdentityManager />}
          {activeTab === "settings" && <SettingsManager />}
          {activeTab === "analytics" && <AnalyticsManager />}
        </div>
      </main>
    </div>
  );
}
