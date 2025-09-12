import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { ProductCard } from '@/components/store/ProductCard';
import { CategoryFilter } from '@/components/store/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types/Store';

const Store = () => {
  const { language } = useLanguage();
  const { getTotalItems, setIsOpen } = useCart();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Products query result:', { data, error });
      if (error) throw error;
      const safeData = (data || []) as unknown as Product[];
      setProducts(safeData);

      // Auto-sync from Printify if no products are found (one-time)
      if (safeData.length === 0 && !hasAttemptedSync) {
        console.log('No products found locally. Auto-syncing from Printify...');
        setHasAttemptedSync(true);
        try {
          const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-printify-products');
          if (syncError) throw syncError;
          console.log('Auto-sync result:', syncData);
        } catch (syncErr) {
          console.error('Auto-sync failed:', syncErr);
        } finally {
          // Try to fetch again after sync attempt
          const { data: refreshed } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          setProducts((refreshed || []) as unknown as Product[]);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories((data || []) as unknown as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product: Product) => {
    navigate(`/store/product/${product.id}`);
  };

  const handleSyncProducts = async () => {
    setHasAttemptedSync(true);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-printify-products');
      if (error) throw error;
      
      console.log('Sync result:', data);
      await fetchProducts(); // Refresh products list
    } catch (error) {
      console.error('Error syncing products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {language === 'es' ? 'Tienda de Café' : 'Coffee Store'}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {language === 'es' 
              ? 'Café artesanal de las montañas de Puerto Rico'
              : 'Artisanal coffee from the mountains of Puerto Rico'
            }
          </p>
          
          {/* Cart button */}
          <div className="flex justify-center mb-6">
            <Button 
              onClick={() => setIsOpen(true)}
              className="relative"
              variant="outline"
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              {language === 'es' ? 'Carrito' : 'Cart'}
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={language === 'es' ? 'Buscar productos...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button 
            onClick={handleSyncProducts}
            disabled={loading}
            variant="outline"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {language === 'es' ? 'Sincronizar productos' : 'Sync products'}
          </Button>
        </div>

        {/* Category Filter */}
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === 'es' 
                ? 'No se encontraron productos.'
                : 'No products found.'
              }
            </p>
            {products.length === 0 && (
              <p className="text-muted-foreground text-sm mt-2">
                {language === 'es' 
                  ? 'Haz clic en "Sincronizar productos" para cargar los productos desde Printify.'
                  : 'Click "Sync products" to load products from Printify.'
                }
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;