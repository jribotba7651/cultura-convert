export interface BlogPost {
  id: string;
  title: {
    es: string;
    en: string;
  };
  excerpt: {
    es: string;
    en: string;
  };
  content: {
    es: string;
    en: string;
  };
  date: string;
  category: {
    es: string;
    en: string;
  };
  tags: string[];
  slug: string;
  image?: string;
}