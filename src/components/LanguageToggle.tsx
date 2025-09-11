import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const LanguageToggle = () => {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const { toast } = useToast();

  const handleLanguageChange = (newLang: 'es' | 'en') => {
    setLanguage(newLang);
    toast({
      title: "Idioma cambiado",
      description: `Idioma cambiado a ${newLang === 'es' ? 'Español' : 'English'}`,
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
        Español
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
        className="text-sm"
      >
        English
      </Button>
    </div>
  );
};

export default LanguageToggle;