import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Clock, MapPin, Star, Users, Award } from "lucide-react";
import rosnelmaProfile from "@/assets/rosnelma-garcia-profile.jpg";

const Services = () => {
  const { t, language } = useLanguage();

  const services = [
    {
      title: {
        en: "Individual Coaching Sessions",
        es: "Sesiones de Coaching Individual"
      },
      price: "$150/hour",
      description: {
        en: "Personalized coaching sessions focused on leadership development and career advancement for Latino professionals in Corporate America.",
        es: "Sesiones de coaching personalizadas enfocadas en desarrollo de liderazgo y avance profesional para profesionales latinos en Corporate América."
      },
      features: {
        en: ["One-on-one mentoring", "Career strategy planning", "Leadership skills development", "Bilingual sessions available"],
        es: ["Mentoría personalizada", "Planificación de estrategia profesional", "Desarrollo de habilidades de liderazgo", "Sesiones bilingües disponibles"]
      }
    },
    {
      title: {
        en: "Authentic Leadership Workshop",
        es: "Taller de Liderazgo Auténtico"
      },
      price: "Contact for pricing",
      description: {
        en: "Interactive workshop designed specifically for Latina professionals to develop authentic leadership skills and overcome workplace challenges.",
        es: "Taller interactivo diseñado específicamente para profesionales latinas para desarrollar habilidades de liderazgo auténtico y superar desafíos laborales."
      },
      features: {
        en: ["Group dynamics", "Interactive exercises", "Networking opportunities", "Practical tools and strategies"],
        es: ["Dinámicas grupales", "Ejercicios interactivos", "Oportunidades de networking", "Herramientas y estrategias prácticas"]
      }
    },
    {
      title: {
        en: "Corporate Consulting",
        es: "Consultoría Corporativa"
      },
      price: "Custom packages",
      description: {
        en: "Specialized consulting services for organizations focused on retaining and developing Latino talent in corporate environments.",
        es: "Servicios de consultoría especializados para organizaciones enfocados en retener y desarrollar talento latino en ambientes corporativos."
      },
      features: {
        en: ["Diversity & inclusion strategies", "Leadership development programs", "Cultural competency training", "Retention analysis"],
        es: ["Estrategias de diversidad e inclusión", "Programas de desarrollo de liderazgo", "Entrenamiento en competencia cultural", "Análisis de retención"]
      }
    }
  ];

  const openingHours = [
    { day: { en: "Sunday", es: "Domingo" }, hours: "09:00 AM - 06:00 PM" },
    { day: { en: "Monday", es: "Lunes" }, hours: "06:00 AM - 10:00 PM" },
    { day: { en: "Tuesday", es: "Martes" }, hours: "06:00 AM - 10:00 PM" },
    { day: { en: "Wednesday", es: "Miércoles" }, hours: "06:00 AM - 10:00 PM" },
    { day: { en: "Thursday", es: "Jueves" }, hours: "06:00 AM - 10:00 PM" },
    { day: { en: "Friday", es: "Viernes" }, hours: "06:00 AM - 08:00 AM" },
    { day: { en: "Saturday", es: "Sábado" }, hours: "Closed / Cerrado" }
  ];

  const handleBookAppointment = () => {
    window.open('https://jibaroenlaluna.simplybook.me/v2/', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="text-sm font-medium">
                  {language === 'en' ? 'Professional Coaching Services' : 'Servicios de Coaching Profesional'}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Jíbaro En La Luna
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {language === 'en' 
                    ? 'Professional coaching and leadership development for Latino professionals navigating Corporate America. 22 years of engineering leadership experience.'
                    : 'Coaching profesional y desarrollo de liderazgo para profesionales latinos navegando Corporate América. 22 años de experiencia en liderazgo en ingeniería.'
                  }
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleBookAppointment} size="lg" className="gap-2">
                    <Calendar className="h-5 w-5" />
                    {language === 'en' ? 'Book Consultation' : 'Reservar Consulta'}
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2" asChild>
                    <a href="mailto:rosnelma@jibaroenlaluna.com">
                      <Mail className="h-5 w-5" />
                      {language === 'en' ? 'Contact' : 'Contactar'}
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative w-full max-w-md mx-auto">
                  <img 
                    src={rosnelmaProfile} 
                    alt="Rosnelma García - Professional Coach"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <span className="font-semibold">22+ {language === 'en' ? 'Years' : 'Años'}</span>
                    </div>
                    <p className="text-sm opacity-90">
                      {language === 'en' ? 'Leadership Experience' : 'Experiencia en Liderazgo'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {language === 'en' ? 'Our Services' : 'Nuestros Servicios'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'en' 
                  ? 'Empowering Latino professionals with the tools and strategies needed for authentic leadership and career success.'
                  : 'Empoderando a profesionales latinos con las herramientas y estrategias necesarias para el liderazgo auténtico y el éxito profesional.'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">
                      {service.title[language]}
                    </CardTitle>
                    <Badge variant="outline" className="w-fit">
                      {service.price}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base leading-relaxed">
                      {service.description[language]}
                    </CardDescription>
                    <ul className="space-y-2">
                      {service.features[language].map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm">
                          <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Hours Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Mail className="h-6 w-6 text-primary" />
                    {language === 'en' ? 'Contact Information' : 'Información de Contacto'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <a href="tel:+17876334714" className="text-foreground hover:text-primary transition-colors">
                        +1 (787) 633-4714
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <a href="mailto:rosnelma@jibaroenlaluna.com" className="text-foreground hover:text-primary transition-colors">
                        rosnelma@jibaroenlaluna.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="text-foreground">
                        {language === 'en' ? 'Virtual & In-Person Sessions Available' : 'Sesiones Virtuales y Presenciales Disponibles'}
                      </span>
                    </div>
                  </div>
                  <Button onClick={handleBookAppointment} className="w-full gap-2">
                    <Calendar className="h-5 w-5" />
                    {language === 'en' ? 'Schedule Your Consultation' : 'Programa tu Consulta'}
                  </Button>
                </CardContent>
              </Card>

              {/* Opening Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Clock className="h-6 w-6 text-primary" />
                    {language === 'en' ? 'Business Hours' : 'Horarios de Atención'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {openingHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="font-medium text-foreground">
                          {schedule.day[language]}
                        </span>
                        <span className="text-muted-foreground">
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' 
                        ? 'All sessions are available in English and Spanish. Weekend appointments available upon request.'
                        : 'Todas las sesiones están disponibles en inglés y español. Citas de fin de semana disponibles bajo solicitud.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;