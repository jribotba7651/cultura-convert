import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/Store';
import { useToast } from '@/hooks/use-toast';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data as unknown as Product);
      
      if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
        setSelectedVariant((data.variants as any)[0].id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/store');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity, selectedVariant);
    toast({
      title: language === 'es' ? 'Agregado al carrito' : 'Added to cart',
      description: language === 'es' 
        ? `${quantity}x ${product.title[language]} agregado a tu carrito`
        : `${quantity}x ${product.title[language]} added to your cart`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-96 bg-muted rounded"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === 'es' ? 'Producto no encontrado' : 'Product not found'}
            </p>
            <Button 
              onClick={() => navigate('/store')}
              className="mt-4"
            >
              {language === 'es' ? 'Volver a la tienda' : 'Back to store'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/store')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'es' ? 'Volver a la tienda' : 'Back to store'}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&h=600'}
                alt={product.title[language]}
                className="w-full h-96 object-cover rounded-lg"
              />
              
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  {language === 'es' ? 'Oferta' : 'Sale'}
                </Badge>
              )}
            </div>
            
            {/* Thumbnail images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title[language]} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.title[language]}
              </h1>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-primary">
                  {(() => {
                    if (selectedVariant && product.variants) {
                      const variant = product.variants.find(v => v.id === selectedVariant);
                      if (variant && variant.price) {
                        return formatPrice(variant.price);
                      }
                    }
                    return formatPrice(product.price_cents);
                  })()}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price_cents!)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(showAllTags ? product.tags : product.tags.slice(0, 8)).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {product.tags.length > 8 && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAllTags(!showAllTags)}>
                    {showAllTags ? (language === 'es' ? 'Ver menos' : 'Show less') : (language === 'es' ? 'Ver más' : 'Show more')}
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">
                {language === 'es' ? 'Descripción' : 'Description'}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description[language]}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">
                  {language === 'es' ? 'Variante' : 'Variant'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariant(variant.id)}
                    >
                      {variant.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {language === 'es' ? 'Cantidad' : 'Quantity'}
                </h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {language === 'es' ? 'Agregar al carrito' : 'Add to cart'}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                  className={isLiked ? 'text-destructive border-destructive' : ''}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Shipping info */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                {language === 'es' ? 'Envío' : 'Shipping'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'es' 
                  ? 'Envío gratuito en pedidos superiores a $50. Entrega en 3-5 días hábiles.'
                  : 'Free shipping on orders over $50. Delivery in 3-5 business days.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;