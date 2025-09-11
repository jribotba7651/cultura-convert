import { Button } from "@/components/ui/button";
import { useState } from "react";

const LanguageToggle = () => {
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
      <Button
        variant={language === 'es' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('es')}
        className="text-sm"
      >
        Español
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="text-sm"
      >
        English
      </Button>
    </div>
  );
};

export default LanguageToggle;