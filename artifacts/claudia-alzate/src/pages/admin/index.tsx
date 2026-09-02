import { useState } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, User as UserIcon, Settings, LogOut, BarChart2 } from "lucide-react";
import logoPath from "@assets/image_1781908878316.png";

import { LinksManager } from "@/components/admin/links-manager";
import { IdentityManager } from "@/components/admin/identity-manager";
import { SettingsManager } from "@/components/admin/settings-manager";
import { AnalyticsManager } from "@/components/admin/analytics-manager";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"links" | "identity" | "settings" | "analytics">("links");

  const { data: user, isLoading, isError } = useGetMe({
    query: { 
      queryKey: getGetMeQueryKey(),
      retry: false
    }
  });

  const logoutMutation = useLogout();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  }

  if (isError || !user) {
    setLocation("/admin/login");
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("auth_token");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/admin/login");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-6 flex flex-col items-center border-b border-sidebar-border border-b-primary/20 relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary"></div>
          <img src={logoPath} alt="Logo" className="w-16 h-16 rounded-full mb-4 ring-2 ring-primary/20" />
          <h2 className="font-serif text-lg text-sidebar-foreground">Admin Portal</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("links")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "links" ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"}`}
          >
            <Link2 className="w-5 h-5" />
            <span className="font-medium">Manage Links</span>
          </button>
          <button 
            onClick={() => setActiveTab("identity")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "identity" ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"}`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">Brand Identity</span>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "settings" ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "analytics" ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-background/50 overflow-auto">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="font-serif text-lg">Admin Portal</h2>
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="bg-transparent border border-border rounded p-2 text-sm"
          >
            <option value="links">Links</option>
            <option value="identity">Identity</option>
            <option value="settings">Settings</option>
            <option value="analytics">Analytics</option>
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
