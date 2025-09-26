import { useState } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/Store';
import { useToast } from '@/hooks/use-toast';
import { truncateText } from '@/utils/htmlCleaner';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

export const ProductCard = ({ product, onProductClick }: ProductCardProps) => {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);


  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast({
      title: language === 'es' ? 'Agregado al carrito' : 'Added to cart',
      description: language === 'es' 
        ? `${product.title[language]} agregado a tu carrito`
        : `${product.title[language]} added to your cart`,
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const hasDiscount = product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents;

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border"
      onClick={() => onProductClick?.(product)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {(() => {
            const primaryImage = product.images?.[0] || product.printify_data?.images?.[0]?.src || '/placeholder.svg';
            return (
              <img
                src={primaryImage}
                alt={`${product.title[language]} product image`}
                loading="lazy"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            );
          })()}
          
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              {language === 'es' ? 'Oferta' : 'Sale'}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 transition-colors ${
              isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
            }`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-2">
            {product.title[language]}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {truncateText(product.description[language] || product.description?.es || product.description?.en || '', 120)}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags && product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-3">
            {(() => {
              const variants = product.variants || [];
              const prices = variants.map(v => v.price).filter(p => p != null);
              const minPrice = prices.length > 0 ? Math.min(...prices) : product.price_cents;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : product.price_cents;
              const hasVariation = minPrice !== maxPrice;

              return (
                <>
                  <span className="text-xl font-bold text-primary">
                    {hasVariation 
                      ? `${language === 'es' ? 'Desde' : 'From'} ${formatPrice(minPrice)}`
                      : formatPrice(product.price_cents)
                    }
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.compare_at_price_cents!)}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {language === 'es' ? 'Agregar al carrito' : 'Add to cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};