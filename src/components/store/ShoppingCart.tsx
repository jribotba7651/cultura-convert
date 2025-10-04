import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

// Import book cover images
import raicesCover from '@/assets/raices-en-tierra-ajena-cover.jpg';
import sofiaCover from '@/assets/sofia-marie-paloma-cover.jpg';
import jibaraCover from '@/assets/jibara-en-la-luna-cover.jpg';
import cartasCover from '@/assets/cartas-de-newark-cover.jpg';

// Helper to resolve image paths
const resolveImagePath = (path: string): string => {
  if (!path) return '/placeholder.svg';
  
  // If it's already a full URL (e.g., from Printify), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Map /src/assets paths to imported images
  const imageMap: Record<string, string> = {
    '/src/assets/raices-en-tierra-ajena-cover.jpg': raicesCover,
    '/src/assets/sofia-marie-paloma-cover.jpg': sofiaCover,
    '/src/assets/jibara-en-la-luna-cover.jpg': jibaraCover,
    '/src/assets/cartas-de-newark-cover.jpg': cartasCover,
  };
  
  return imageMap[path] || '/placeholder.svg';
};

export const ShoppingCart = () => {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice,
    getTotalItems 
  } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const shippingCost = 599; // $5.99 flat rate
  const totalWithShipping = getTotalPrice() + shippingCost;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {language === 'es' ? 'Carrito de compras' : 'Shopping Cart'}
            {getTotalItems() > 0 && (
              <span className="text-sm text-muted-foreground">
                ({getTotalItems()} {language === 'es' ? 'artículos' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'es' 
                  ? 'Tu carrito está vacío' 
                  : 'Your cart is empty'
                }
              </p>
              <SheetClose asChild>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/store')}
                >
                  {language === 'es' ? 'Continuar comprando' : 'Continue shopping'}
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border border-border rounded-lg">
                  <img
                    src={resolveImagePath(item.product.images[0] || item.product.printify_data?.images?.[0]?.src || '/placeholder.svg')}
                    alt={item.product.title[language]}
                    className="w-16 h-16 object-contain bg-muted rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {item.product.title[language]}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.product.price_cents)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant_id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant_id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFromCart(item.product.id, item.variant_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <p className="font-medium text-sm">
                      {formatPrice(item.product.price_cents * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>{language === 'es' ? 'Subtotal' : 'Subtotal'}</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{language === 'es' ? 'Envío' : 'Shipping'}</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>{language === 'es' ? 'Total' : 'Total'}</span>
                <span>{formatPrice(totalWithShipping)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCheckout}
            >
              {language === 'es' ? 'Proceder al pago' : 'Proceed to checkout'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};