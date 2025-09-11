import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const Navigation = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: "/", label: t('home') },
    { path: "/blog", label: t('blog') },
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
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;