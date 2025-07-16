import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, Quote, Settings, Home } from "lucide-react";
import logoPath from "@assets/Main Brand Logo_1752655471601.png";

export function MainNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Quote Generator", icon: Home },
    { path: "/quotes", label: "Quote History", icon: Quote },
    { path: "/clients", label: "Client Management", icon: Users },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <Card className="bg-white shadow-md border-b border-slate-200 rounded-none">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src={logoPath} 
              alt="My Abroad Ally" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900">My Abroad Ally</h1>
              <p className="text-xs text-slate-600">Educational Travel Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? "bg-primary text-white" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </Card>
  );
}