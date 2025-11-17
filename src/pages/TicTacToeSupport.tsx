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
import ticTacToeScreenshot from "@/assets/tic-tac-toe-screenshot.png";

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
              
              {/* App Screenshot */}
              <div className="max-w-sm mx-auto mb-8">
                <img 
                  src={ticTacToeScreenshot} 
                  alt="Tic-Tac-Toe App Screenshot - Luna Mode with colorful emojis"
                  className="rounded-3xl shadow-2xl border-4 border-primary/20"
                />
              </div>
            </div>

            {/* Status Banner */}
            <Card className="bg-primary/5 border-primary/20 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Heart className="w-6 h-6 text-primary" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground mb-4">
                  {language === 'es' 
                    ? 'Próximamente disponible en Apple App Store para iPhone y iPad'
                    : 'Coming soon to Apple App Store for iPhone and iPad'}
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                  <Gamepad2 className="w-5 h-5" />
                  Apple App Store
                </div>
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

        {/* Privacy Policy Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center mb-4">Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground">
                  This privacy policy applies to the Jibaro Tic Tac Toe app (hereby referred to as "Application") for mobile devices that was created by Jibaro en la luna llc (hereby referred to as "Service Provider") as an Ad Supported service. This service is intended for use "AS IS".
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Information Collection and Use</h3>
                <p className="text-muted-foreground">
                  The Application collects information when you download and use it. This information may include information such as:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Your device's Internet Protocol address (e.g. IP address)</li>
                  <li>The pages of the Application that you visit, the time and date of your visit, the time spent on those pages</li>
                  <li>The time spent on the Application</li>
                  <li>The operating system you use on your mobile device</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  The Application does not gather precise information about the location of your mobile device.
                </p>
                <p className="text-muted-foreground">
                  The Application collects your device's location, which helps the Service Provider determine your approximate geographical location and make use of in below ways:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Geolocation Services:</strong> The Service Provider utilizes location data to provide features such as personalized content, relevant recommendations, and location-based services.</li>
                  <li><strong>Analytics and Improvements:</strong> Aggregated and anonymized location data helps the Service Provider to analyze user behavior, identify trends, and improve the overall performance and functionality of the Application.</li>
                  <li><strong>Third-Party Services:</strong> Periodically, the Service Provider may transmit anonymized location data to external services. These services assist them in enhancing the Application and optimizing their offerings.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.
                </p>
                <p className="text-muted-foreground">
                  For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to jribot@gmail.com. The information that the Service Provider request will be retained by them and used as described in this privacy policy.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Third Party Access</h3>
                <p className="text-muted-foreground">
                  Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.
                </p>
                <p className="text-muted-foreground">
                  Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>
                    <a href="https://support.google.com/admob/answer/6128543?hl=en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      AdMob
                    </a>
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  The Service Provider may disclose User Provided and Automatically Collected Information:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>as required by law, such as to comply with a subpoena, or similar legal process;</li>
                  <li>when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;</li>
                  <li>with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Opt-Out Rights</h3>
                <p className="text-muted-foreground">
                  You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Data Retention Policy</h3>
                <p className="text-muted-foreground">
                  The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, please contact them at jribot@gmail.com and they will respond in a reasonable time.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Children</h3>
                <p className="text-muted-foreground">
                  The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
                </p>
                <p className="text-muted-foreground">
                  The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider discover that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider (jribot@gmail.com) so that they will be able to take the necessary actions.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Security</h3>
                <p className="text-muted-foreground">
                  The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Changes</h3>
                <p className="text-muted-foreground">
                  This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
                </p>
                <p className="text-muted-foreground">
                  This privacy policy is effective as of 2025-11-17
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Your Consent</h3>
                <p className="text-muted-foreground">
                  By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at jribot@gmail.com.
                </p>

                <hr className="my-6 border-border" />
                
                <p className="text-xs text-muted-foreground text-center">
                  This privacy policy page was generated by{' '}
                  <a href="https://app-privacy-policy-generator.nisrulz.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    App Privacy Policy Generator
                  </a>
                </p>
              </CardContent>
            </Card>
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
