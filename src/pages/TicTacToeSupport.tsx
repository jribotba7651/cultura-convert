import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { NewsletterModal } from "@/components/NewsletterModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Heart, Mail, Sparkles, Users, Volume2, CircleDollarSign } from "lucide-react";

const TicTacToeSupport = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: language === 'es' ? "Mensaje enviado" : "Message sent",
        description: language === 'es' 
          ? "Gracias por contactarnos. Responderemos pronto." 
          : "Thank you for contacting us. We'll respond soon.",
      });
      
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: language === 'es' ? "Error" : "Error",
        description: language === 'es' 
          ? "No se pudo enviar el mensaje. Intenta de nuevo." 
          : "Could not send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = language === 'es' ? [
    {
      question: "¿Cómo se juega?",
      answer: "Tic-Tac-Toe es el clásico juego de tres en raya. Los jugadores se turnan para colocar sus símbolos (emojis coloridos) en una cuadrícula de 3×3. El primer jugador en conseguir tres de sus símbolos en línea (horizontal, vertical o diagonal) gana."
    },
    {
      question: "¿Cuántos anuncios hay?",
      answer: "Mantenemos los anuncios al mínimo: solo 1 anuncio cada 5 juegos. Queremos que disfrutes tiempo de calidad con tu familia sin interrupciones constantes."
    },
    {
      question: "¿Por qué no hay música?",
      answer: "Eliminamos la música de fondo para evitar distracciones y permitir conversaciones naturales entre padres e hijos durante el juego. El enfoque está en el tiempo de calidad juntos."
    },
    {
      question: "¿En qué dispositivos funciona?",
      answer: "La app estará disponible en la App Store de Apple para iPhone y iPad. Pronto también en dispositivos Android."
    },
    {
      question: "¿Es gratis?",
      answer: "Sí, la app es completamente gratuita. Los anuncios mínimos nos ayudan a mantener el servicio sin costo para las familias."
    }
  ] : [
    {
      question: "How do I play?",
      answer: "Tic-Tac-Toe is the classic three-in-a-row game. Players take turns placing their symbols (colorful emojis) on a 3×3 grid. The first player to get three of their symbols in a line (horizontal, vertical, or diagonal) wins."
    },
    {
      question: "How many ads are there?",
      answer: "We keep ads to a minimum: only 1 ad every 5 games. We want you to enjoy quality time with your family without constant interruptions."
    },
    {
      question: "Why is there no music?",
      answer: "We removed background music to avoid distractions and allow natural conversations between parents and children during gameplay. The focus is on quality time together."
    },
    {
      question: "What devices does it work on?",
      answer: "The app will be available on Apple's App Store for iPhone and iPad. Android devices coming soon."
    },
    {
      question: "Is it free?",
      answer: "Yes, the app is completely free. Minimal ads help us maintain the service at no cost to families."
    }
  ];

  const features = language === 'es' ? [
    {
      icon: Sparkles,
      title: "Diseño Colorido",
      description: "Emojis brillantes y colores vibrantes diseñados para captar la atención de los niños"
    },
    {
      icon: CircleDollarSign,
      title: "Anuncios Mínimos",
      description: "Solo 1 anuncio cada 5 juegos para no interrumpir la diversión familiar"
    },
    {
      icon: Volume2,
      title: "Sin Música Molesta",
      description: "Disfruta conversaciones naturales sin música de fondo que distraiga"
    },
    {
      icon: Users,
      title: "Tiempo en Familia",
      description: "Perfecto para crear momentos memorables entre padres e hijos"
    }
  ] : [
    {
      icon: Sparkles,
      title: "Colorful Design",
      description: "Bright emojis and vibrant colors designed to capture children's attention"
    },
    {
      icon: CircleDollarSign,
      title: "Minimal Ads",
      description: "Only 1 ad every 5 games to not interrupt family fun"
    },
    {
      icon: Volume2,
      title: "No Annoying Music",
      description: "Enjoy natural conversations without distracting background music"
    },
    {
      icon: Users,
      title: "Family Time",
      description: "Perfect for creating memorable moments between parents and children"
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('tictactoeTitle')} | {t('siteTitle')}</title>
        <meta name="description" content={t('tictactoeMetaDesc')} />
        <meta property="og:title" content={`${t('tictactoeTitle')} | ${t('siteTitle')}`} />
        <meta property="og:description" content={t('tictactoeMetaDesc')} />
        <link rel="canonical" href="https://jibaroenlaluna.com/tic-tac-toe-support" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <Navigation />
        <NewsletterModal />

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="secondary">
                <Gamepad2 className="w-3 h-3 mr-1" />
                {t('tictactoeComingSoon')}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t('tictactoeTitle')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {t('tictactoeSubtitle')}
              </p>
            </div>

            {/* Status Banner */}
            <Card className="bg-primary/5 border-primary/20 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  {t('tictactoeStatus')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('tictactoeStatusDesc')}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center">{t('tictactoeFeatures')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <feature.icon className="w-10 h-10 mb-3 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">{t('tictattoeFAQ')}</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t('tictactoeContactTitle')}
                </CardTitle>
                <CardDescription>{t('tictactoeContactDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contactName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder={language === 'es' ? "Tu nombre" : "Your name"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contactSubject')}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder={language === 'es' ? "Asunto del mensaje" : "Message subject"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contactMessage')}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder={language === 'es' 
                        ? "Cuéntanos cómo podemos ayudarte..." 
                        : "Tell us how we can help you..."}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting 
                      ? (language === 'es' ? "Enviando..." : "Sending...") 
                      : (language === 'es' ? "Enviar Mensaje" : "Send Message")}
                  </Button>
                </form>
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    {language === 'es' ? "O escríbenos directamente a:" : "Or email us directly at:"}{" "}
                    <a href="mailto:support@jibaroenlaluna.com" className="text-primary hover:underline">
                      support@jibaroenlaluna.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t">
          <div className="container mx-auto max-w-6xl text-center">
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              {t('tictactoeFooter')}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default TicTacToeSupport;
