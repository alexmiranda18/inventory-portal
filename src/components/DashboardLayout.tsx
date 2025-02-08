import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "./ui/use-toast"; // Importe o useToast

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast(); // Inicialize o useToast

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
  
      // Chama a rota de logout no backend (se necessário)
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      localStorage.removeItem("token"); // Remove o token do localStorage
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
        variant: "default",
      });
      navigate("/login"); // Redireciona para a página de login
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao tentar fazer logout.",
        variant: "destructive",
      });
    }
  };

  const links = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Categorias",
      icon: Tags,
      href: "/categories",
    },
    {
      title: "Produtos",
      icon: Package,
      href: "/products",
    },
    {
      title: "Estoque",
      icon: BookOpen,
      href: "/stock",
    },
  ];

  return (
    <div className={cn("pb-12 bg-sidebar-background", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-primary-800">
            StockPro
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 text-gray-700 transition-colors duration-200",
                  location.pathname === link.href
                    ? "bg-primary-600 text-gray-800"
                    : "transparent"
                )}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-800 hover:bg-primary-600 hover:text-gray-800"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed left-4 top-4 z-50 block md:hidden p-2 rounded-lg bg-primary-600 text-black hover:bg-primary-700 transition-colors duration-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar-background transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ScrollArea className="h-full">
          <Sidebar />
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6 bg-white rounded-lg shadow-sm m-4">
          {children}
        </main>
      </div>
    </div>
  );
}