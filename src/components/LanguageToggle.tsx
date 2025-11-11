import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = (newLang: 'es' | 'en') => {
    setLanguage(newLang);
    toast({
      title: t('languageChanged'),
      description: `${t('languageChangedDesc')} ${newLang === 'es' ? t('spanish') : t('english')}`,
    });
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border border-border/50">
      <Globe className="h-4 w-4 ml-2 text-muted-foreground" />
      <Button
        variant={language === 'es' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleLanguageChange('es')}
        className="text-sm font-medium min-w-[70px] transition-all"
      >
        <span className="mr-1">🇪🇸</span>
        ES
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
        className="text-sm font-medium min-w-[70px] transition-all"
      >
        <span className="mr-1">🇺🇸</span>
        EN
      </Button>
    </div>
  );
};

export default LanguageToggle;