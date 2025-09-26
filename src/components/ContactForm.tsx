import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "El nombre es requerido" }).max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  email: z.string().trim().email({ message: "Email inválido" }).max(255, { message: "El email debe tener menos de 255 caracteres" }),
  subject: z.string().trim().min(1, { message: "El asunto es requerido" }).max(200, { message: "El asunto debe tener menos de 200 caracteres" }),
  message: z.string().trim().min(10, { message: "El mensaje debe tener al menos 10 caracteres" }).max(2000, { message: "El mensaje debe tener menos de 2000 caracteres" })
});

interface ContactFormProps {
  className?: string;
}

export const ContactForm = ({ className = '' }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData);

      // Send email via Supabase edge function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: validatedData
      });

      if (error) {
        console.error('Error sending email:', error);
        throw new Error(error.message || 'Error al enviar el mensaje');
      }

      toast({
        title: language === 'es' ? '¡Mensaje enviado!' : 'Message sent!',
        description: language === 'es' 
          ? 'Tu mensaje ha sido enviado correctamente. Te responderemos pronto.' 
          : 'Your message has been sent successfully. We\'ll respond soon.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error: any) {
      console.error('Contact form error:', error);
      
      let errorMessage = language === 'es' 
        ? 'Error al enviar el mensaje. Por favor, intenta de nuevo.' 
        : 'Error sending message. Please try again.';

      if (error instanceof z.ZodError) {
        errorMessage = error.errors[0].message;
      }

      toast({
        variant: "destructive",
        title: language === 'es' ? 'Error' : 'Error',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Mail className="h-6 w-6 text-primary" />
          {language === 'es' ? 'Contactanos' : 'Contact Us'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {language === 'es' ? 'Nombre' : 'Name'} *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={language === 'es' ? 'Tu nombre completo' : 'Your full name'}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {language === 'es' ? 'Email' : 'Email'} *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                required
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {language === 'es' ? 'Asunto' : 'Subject'} *
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder={language === 'es' ? '¿De qué quieres hablar?' : 'What would you like to talk about?'}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              {language === 'es' ? 'Mensaje' : 'Message'} *
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={language === 'es' 
                ? 'Escribe tu mensaje aquí. Nos encantaría conocer tu opinión sobre nuestros libros o servicios...' 
                : 'Write your message here. We\'d love to hear your thoughts about our books or services...'}
              required
              minLength={10}
              maxLength={2000}
              rows={6}
              className="resize-none"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.message.length}/2000
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                {language === 'es' ? 'Enviando...' : 'Sending...'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {language === 'es' ? 'Enviar Mensaje' : 'Send Message'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            {language === 'es' 
              ? 'También puedes escribirnos directamente a: ' 
              : 'You can also write to us directly at: '}
            <a 
              href="mailto:jribot@jibaroenlaluna.com" 
              className="text-primary hover:underline font-medium"
            >
              jribot@jibaroenlaluna.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};