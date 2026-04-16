import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, Database, Heart, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/inventory', label: 'Estoque', icon: Package },
    { path: '/shopping-list', label: 'Lista', icon: ShoppingCart },
    { path: '/data', label: 'Dados', icon: Database },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <h1 className="font-bold text-lg">🛒 Estoque & Compras</h1>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              aria-label="Alternar tema"
              className="h-9 w-9"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => signOut()} 
              aria-label="Sair"
              className="h-9 w-9"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="container flex px-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container py-6 px-4">
        <Outlet />
      </main>

      {/* Footer com Doação */}
      <footer className="border-t py-3 bg-background">
        <div className="container flex justify-center px-4">
          <Link to="/donation">
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Apoiar com PIX
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}