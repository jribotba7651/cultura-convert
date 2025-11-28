import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'newsletter_modal_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const newsletterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  interests: z.array(z.string()).min(1, 'Selecciona al menos un interés'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterModalProps {
  /** Optional webhook endpoint for newsletter service (Mailchimp, ConvertKit, etc.) */
  webhookEndpoint?: string;
}

export const NewsletterModal = ({ webhookEndpoint }: NewsletterModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      name: '',
      email: '',
      interests: [],
    },
  });

  const interestOptions = [
    { id: 'literatura', label: language === 'es' ? 'Literatura/Narrativa' : 'Literature/Narrative' },
    { id: 'diaspora', label: language === 'es' ? 'Temas de Diáspora' : 'Diaspora Topics' },
    { id: 'masterdata', label: 'Master Data/Supply Chain' },
    { id: 'all', label: language === 'es' ? 'Todos los temas' : 'All Topics' },
  ];

  // Check if modal should be shown - runs once on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();
      
      // If it's been more than 7 days, clear the dismissal
      if (now - dismissedTime > DISMISS_DURATION) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        // Modal was dismissed recently, don't show it
        return;
      }
    }

    // Set up timeout to show modal after 30 seconds
    const timeoutId = setTimeout(() => {
      setIsOpen(true);
    }, 30000);

    return () => clearTimeout(timeoutId);
  }, []); // Only run once on mount

  // Handle scroll tracking
  useEffect(() => {
    // Check if modal was dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime <= DISMISS_DURATION) {
        return; // Don't track scroll if dismissed recently
      }
    }

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage >= 50 && !hasScrolledEnough && !isOpen) {
        setHasScrolledEnough(true);
        setIsOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolledEnough, isOpen]);

  // Exit-intent detection
  useEffect(() => {
    // Check if modal was dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime <= DISMISS_DURATION) {
        return; // Don't track mouse leave if dismissed recently
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isOpen) {
        setIsOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      console.log('Newsletter subscription:', data);

      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: {
          ...data,
          language,
          webhookEndpoint,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: language === 'es' ? '¡Gracias por suscribirte!' : 'Thanks for subscribing!',
        description: language === 'es' 
          ? 'Pronto recibirás contenido exclusivo en tu email.' 
          : "You'll soon receive exclusive content in your email.",
      });

      // Track conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'newsletter_signup', {
          event_category: 'engagement',
          event_label: data.interests.join(','),
        });
      }

      handleClose();
      form.reset();
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' 
          ? 'Hubo un problema al procesar tu suscripción. Por favor intenta de nuevo.' 
          : 'There was a problem processing your subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-foreground" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {language === 'es' ? 'Únete a Nuestra Comunidad Literaria' : 'Join Our Literary Community'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {language === 'es' 
              ? 'Recibe contenido exclusivo sobre literatura latina, identidad diaspórica, y reflexiones sobre nuestra experiencia puertorriqueña. También artículos técnicos sobre master data governance y supply chain management.'
              : 'Receive exclusive content about Latin literature, diasporic identity, and reflections on our Puerto Rican experience. Also technical articles about master data governance and supply chain management.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{language === 'es' ? 'Nombre' : 'Name'}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === 'es' ? 'Tu nombre' : 'Your name'} 
                      {...field} 
                      className="bg-background border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="tu@email.com" 
                      {...field}
                      className="bg-background border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    {language === 'es' ? 'Intereses' : 'Interests'}
                  </FormLabel>
                  <div className="space-y-2">
                    {interestOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), option.id]
                                    : field.value?.filter((value) => value !== option.id);
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-foreground">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting 
                ? (language === 'es' ? 'Suscribiendo...' : 'Subscribing...') 
                : (language === 'es' ? 'Suscribirme' : 'Subscribe')}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {language === 'es' 
                ? 'Al suscribirte, aceptas recibir emails de Jíbaro en la Luna. Puedes darte de baja en cualquier momento. Respetamos tu privacidad según GDPR.'
                : "By subscribing, you agree to receive emails from Jíbaro en la Luna. You can unsubscribe at any time. We respect your privacy according to GDPR."}
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
