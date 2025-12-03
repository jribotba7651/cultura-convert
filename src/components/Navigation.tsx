import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import LanguageToggle from "./LanguageToggle";
import UserMenu from "./UserMenu";

const Navigation = () => {
  const { t } = useLanguage();
  const { getTotalItems, setIsOpen } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: t('home') },
    { path: "/nosotros", label: t('language') === 'es' ? 'Nosotros' : 'About Us' },
    { path: "/blog", label: t('blog') },
    { path: "/services", label: t('services') },
    { path: "/consulting", label: "Consulting" },
    { path: "/proyectos", label: t('projects') },
    { path: "/store", label: t('store') },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl md:text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            {t('siteTitle')}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-4">
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

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-2">
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
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg text-foreground hover:text-primary transition-colors px-4 py-3 rounded-md ${
                        location.pathname === item.path ? 'bg-accent text-accent-foreground font-medium' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-border pt-4 px-4 space-y-4">
                    <UserMenu />
                    <LanguageToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;