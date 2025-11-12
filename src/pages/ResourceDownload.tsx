import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileText, CheckCircle2, Users, Star } from "lucide-react";

interface ConsultingResource {
  id: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  file_path: string;
  file_name: string;
  file_size_bytes: number;
  download_count: number;
  is_featured: boolean;
  slug: string;
}

export default function ResourceDownload() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [resource, setResource] = useState<ConsultingResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
  });

  useEffect(() => {
    fetchResource();
  }, [slug]);

  const fetchResource = async () => {
    try {
      const { data, error } = await supabase
        .from('consulting_resources')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      
      if (!data) {
        navigate('/consulting');
        return;
      }
      
      setResource(data);
    } catch (error) {
      console.error('Error fetching resource:', error);
      toast.error(
        language === "es" 
          ? "Recurso no encontrado" 
          : "Resource not found"
      );
      navigate('/consulting');
    } finally {
      setLoading(false);
    }
  };

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('consulting-resources')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Guardar lead
      const { error } = await supabase.functions.invoke("submit-consulting-lead", {
        body: { 
          ...formData,
          resourceDownloaded: resource?.title_es || resource?.title_en 
        },
      });

      if (error) throw error;

      // Incrementar contador
      if (resource) {
        await supabase
          .from('consulting_resources')
          .update({ download_count: resource.download_count + 1 })
          .eq('id', resource.id);
        
        // Iniciar descarga
        window.open(getPublicUrl(resource.file_path), '_blank');
        
        setDownloadStarted(true);
        toast.success(
          language === "es" 
            ? "¡Descarga iniciada! Revisa tu email para más recursos." 
            : "Download started! Check your email for more resources."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        language === "es" 
          ? "Error al procesar. Intenta de nuevo." 
          : "Error processing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!resource) {
    return null;
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-primary/5 to-background pt-20">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">
                {language === "es" ? "Recurso Gratuito" : "Free Resource"}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === "es" ? resource.title_es : resource.title_en}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {language === "es" ? resource.description_es : resource.description_en}
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <span>
                  <strong className="text-foreground">{resource.download_count}+</strong>{" "}
                  {language === "es" ? "descargas" : "downloads"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>PDF • {formatFileSize(resource.file_size_bytes)}</span>
              </div>
              {resource.is_featured && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  <span>{language === "es" ? "Destacado" : "Featured"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Benefits Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">
                {language === "es" 
                  ? "¿Qué incluye este recurso?" 
                  : "What's included in this resource?"}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === "es" 
                        ? "Guía Práctica Completa" 
                        : "Complete Practical Guide"}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === "es"
                        ? "Frameworks y mejores prácticas probadas en la industria"
                        : "Industry-tested frameworks and best practices"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === "es" 
                        ? "Casos de Estudio Reales" 
                        : "Real Case Studies"}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === "es"
                        ? "Ejemplos reales de implementación exitosa"
                        : "Real examples of successful implementation"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === "es" 
                        ? "Plantillas Listas para Usar" 
                        : "Ready-to-Use Templates"}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === "es"
                        ? "Herramientas y plantillas que puedes aplicar inmediatamente"
                        : "Tools and templates you can apply immediately"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial or Additional Info */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-primary flex-shrink-0" />
                    <p className="text-sm">
                      {language === "es"
                        ? "Únete a profesionales de calidad y supply chain que ya están usando esta guía para mejorar sus procesos."
                        : "Join quality and supply chain professionals who are already using this guide to improve their processes."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Download Form */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>
                  {downloadStarted 
                    ? (language === "es" ? "¡Descarga Iniciada!" : "Download Started!")
                    : (language === "es" ? "Descargar Recurso Gratis" : "Download Free Resource")
                  }
                </CardTitle>
                <CardDescription>
                  {downloadStarted
                    ? (language === "es" 
                        ? "Tu descarga debería comenzar automáticamente. Revisa tu email para más recursos." 
                        : "Your download should start automatically. Check your email for more resources.")
                    : (language === "es"
                        ? "Completa tu información para acceder al recurso"
                        : "Complete your information to access the resource")
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {downloadStarted ? (
                  <div className="space-y-4 text-center py-8">
                    <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                    <p className="text-muted-foreground">
                      {language === "es"
                        ? "Si la descarga no comienza automáticamente, "
                        : "If the download doesn't start automatically, "}
                      <button 
                        onClick={() => resource && window.open(getPublicUrl(resource.file_path), '_blank')}
                        className="text-primary underline"
                      >
                        {language === "es" ? "haz click aquí" : "click here"}
                      </button>
                    </p>
                    <Button 
                      onClick={() => navigate('/consulting')} 
                      variant="outline" 
                      className="w-full"
                    >
                      {language === "es" ? "Ver Más Recursos" : "View More Resources"}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">
                        {language === "es" ? "Nombre Completo" : "Full Name"} *
                      </Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === "es" ? "Tu nombre" : "Your name"}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">
                        {language === "es" ? "Email Corporativo" : "Business Email"} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={language === "es" ? "tu@empresa.com" : "you@company.com"}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company">
                        {language === "es" ? "Empresa" : "Company"} *
                      </Label>
                      <Input
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder={language === "es" ? "Nombre de tu empresa" : "Your company"}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role">
                        {language === "es" ? "Puesto/Rol" : "Job Title"} *
                      </Label>
                      <Input
                        id="role"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder={language === "es" ? "Ej: Gerente de Calidad" : "Ex: Quality Manager"}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>{language === "es" ? "Procesando..." : "Processing..."}</>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          {language === "es" ? "Descargar Ahora" : "Download Now"}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      {language === "es"
                        ? "Al descargar, aceptas recibir emails con recursos y novedades."
                        : "By downloading, you agree to receive emails with resources and updates."}
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
