export interface Book {
  title: string;
  description: {
    es: string;
    en: string;
  };
  status: "published" | "coming-soon";
  amazonUrl?: string;
  amazonHardcoverUrl?: string;
  amazonSoftcoverUrl?: string;
  isbn?: string;
  coverImage?: string;
  price?: string;
  publicationDate?: string;
}