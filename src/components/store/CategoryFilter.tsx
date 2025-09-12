import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: {
    es: string;
    en: string;
    [key: string]: string;
  };
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (categoryId?: string) => void;
}

export const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryFilterProps) => {
  const { language } = useLanguage();
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        variant={!selectedCategory ? "default" : "secondary"}
        className="cursor-pointer transition-colors hover:bg-accent"
        onClick={() => onCategorySelect(undefined)}
      >
        {language === 'es' ? 'Todos' : 'All'}
      </Badge>
      
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "secondary"}
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => onCategorySelect(category.id)}
        >
          {category.name[language] || category.name.en || category.name.es}
        </Badge>
      ))}
    </div>
  );
};