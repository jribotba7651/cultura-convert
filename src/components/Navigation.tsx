import { Link, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LanguageToggle from "./LanguageToggle";
import UserMenu from "./UserMenu";

const Navigation = () => {
  const { t } = useLanguage();
  const { getTotalItems, setIsOpen } = useCart();
  const location = useLocation();

  const navItems = [
    { path: "/", label: t('home') },
    { path: "/blog", label: t('blog') },
    { path: "/services", label: t('services') },
    { path: "/consulting", label: "Consulting" },
    { path: "/proyectos", label: t('projects') },
    { path: "/store", label: t('store') },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            {t('siteTitle')}
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md ${
                    location.pathname === item.path ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <UserMenu />
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;