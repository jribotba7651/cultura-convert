import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
      <Button
        variant={language === 'es' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleLanguageChange('es')}
        className="text-sm"
      >
        {t('spanish')}
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
        className="text-sm"
      >
        {t('english')}
      </Button>
    </div>
  );
};

export default LanguageToggle;