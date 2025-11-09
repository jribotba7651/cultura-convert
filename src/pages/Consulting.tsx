import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Database, 
  Shield, 
  FileCheck, 
  TrendingUp, 
  Users, 
  Award,
  Download,
  CheckCircle2,
  Mail
} from "lucide-react";

const Consulting = () => {
  const { language } = useLanguage();
  const [leadFormData, setLeadFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    companySize: "",
    industry: "",
    mainChallenge: "",
  });
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent, resourceDownloaded: string) => {
    e.preventDefault();
    setIsSubmittingLead(true);

    try {
      const { error } = await supabase.functions.invoke("submit-consulting-lead", {
        body: { ...leadFormData, resourceDownloaded },
      });

      if (error) throw error;

      toast.success(language === "es" ? "¡Acceso enviado a tu email!" : "Access sent to your email!");
      setLeadSubmitted(true);
      setLeadFormData({
        name: "",
        email: "",
        company: "",
        role: "",
        companySize: "",
        industry: "",
        mainChallenge: "",
      });
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error(language === "es" ? "Error al enviar. Intenta de nuevo." : "Error submitting. Please try again.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      const { error } = await supabase.functions.invoke("submit-contact-inquiry", {
        body: contactFormData,
      });

      if (error) throw error;

      toast.success(language === "es" ? "Consulta enviada exitosamente" : "Inquiry sent successfully");
      setContactFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact:", error);
      toast.error(language === "es" ? "Error al enviar. Intenta de nuevo." : "Error submitting. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const services = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: language === "es" ? "Regulatory Compliance Consulting" : "Regulatory Compliance Consulting",
      description: language === "es"
        ? "Implementación de FDA 21 CFR 820.50, ISO 13485, EU MDR; compliance para productos combinados; estrategia y documentación regulatoria; preparación y remediación de auditorías."
        : "FDA 21 CFR 820.50, ISO 13485, EU MDR implementation; combination product compliance; regulatory strategy and documentation; audit preparation and remediation.",
    },
    {
      icon: <FileCheck className="w-8 h-8 text-primary" />,
      title: language === "es" ? "Digital Quality Management Systems (eQMS)" : "Digital Quality Management Systems (eQMS)",
      description: language === "es"
        ? "Transformación digital de procesos de calidad, integración bidireccional ERP–eQMS, controles de cumplimiento automatizados, monitorización en tiempo real."
        : "Digital transformation of quality processes, bidirectional ERP-eQMS integration, automated compliance controls, real-time monitoring.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: language === "es" ? "Supply Chain Risk Management" : "Supply Chain Risk Management",
      description: language === "es"
        ? "Clasificación y seguimiento de proveedores según riesgo, planes de continuidad del negocio, mitigación de proveedores únicos, programas de auditoría y gestión de acciones correctivas."
        : "Risk-based supplier classification and tracking, business continuity plans, single source mitigation, audit programs and corrective action management.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: language === "es" ? "Cross-Functional Process Optimization" : "Cross-Functional Process Optimization",
      description: language === "es"
        ? "Alineamiento Calidad–Compras–Ingeniería, integración de change control entre departamentos, diseño de jerarquía documental, liderazgo de equipos multifuncionales."
        : "Quality-Purchasing-Engineering alignment, cross-departmental change control integration, document hierarchy design, multifunctional team leadership.",
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: language === "es" ? "Industry-Specific Expertise" : "Industry-Specific Expertise",
      description: language === "es"
        ? "Más de 22 años de experiencia en empresas multinacionales y startups de dispositivos médicos, productos combinados y biotecnología."
        : "22+ years of experience in multinational companies and startups in medical devices, combination products, and biotechnology.",
    },
    {
      icon: <Database className="w-8 h-8 text-primary" />,
      title: language === "es" ? "Master Data Governance & ERP Integration" : "Master Data Governance & ERP Integration",
      description: language === "es" 
        ? "Frameworks de gobernanza, integración con SAP/ERP, configuración de vendor master controls y ASL, workflows de qualification y change control."
        : "Governance frameworks, SAP/ERP integration, vendor master controls and ASL configuration, qualification and change control workflows.",
    },
  ];

  const resources = [
    {
      title: language === "es" ? "Guía Completa de Purchasing Controls" : "Complete Purchasing Controls Guide",
      description: language === "es"
        ? "Framework completo de 40+ páginas con experiencia práctica en gestión de proveedores y compliance."
        : "Complete 40+ page framework with practical experience in supplier management and compliance.",
      slug: "purchasing-controls-guide",
    },
    {
      title: language === "es" ? "Framework de Master Data Governance" : "Master Data Governance Framework",
      description: language === "es"
        ? "Guía paso a paso para implementar gobernanza de datos maestros en sistemas ERP."
        : "Step-by-step guide to implement master data governance in ERP systems.",
      slug: "master-data-governance",
    },
    {
      title: language === "es" ? "Checklist de FDA/ISO/MDR Compliance" : "FDA/ISO/MDR Compliance Checklist",
      description: language === "es"
        ? "Checklist detallado para preparación y remediación de auditorías regulatorias."
        : "Detailed checklist for regulatory audit preparation and remediation.",
      slug: "compliance-checklist",
    },
    {
      title: language === "es" ? "De Procedimientos a Controles Automatizados" : "From Procedures to Automated Controls",
      description: language === "es"
        ? "Guía de transformación digital: cómo pasar de procedimientos manuales a controles automatizados en eQMS."
        : "Digital transformation guide: transitioning from manual procedures to automated controls in eQMS.",
      slug: "automated-controls-guide",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Jíbaro en la Luna Consulting
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {language === "es"
                ? "Consultoría especializada en gestión de datos maestros, integración de ERP, calidad digital, cumplimiento normativo y gestión de riesgos. Más de 22 años de experiencia en la industria de dispositivos médicos, productos combinados y biotecnología."
                : "Specialized consulting in master data management, ERP integration, digital quality, regulatory compliance, and risk management. 22+ years of experience in the medical device, combination products, and biotechnology industries."}
            </p>
          </div>

          {/* Process Flow Diagram */}
          <div className="mb-16 p-8 bg-card rounded-lg shadow-lg border border-border">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <Shield className="w-12 h-12 text-primary" />
                <span className="font-semibold">Compliance</span>
              </div>
              <div className="hidden md:block text-4xl text-muted-foreground">→</div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-12 h-12 text-primary" />
                <span className="font-semibold">eQMS</span>
              </div>
              <div className="hidden md:block text-4xl text-muted-foreground">→</div>
              <div className="flex items-center gap-3">
                <Database className="w-12 h-12 text-primary" />
                <div className="flex flex-col">
                  <span className="font-semibold">Master Data</span>
                  <span className="text-sm text-muted-foreground">& ERP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === "es" ? "Servicios y Áreas de Experiencia" : "Services & Areas of Expertise"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section with Lead Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            {language === "es" ? "Recursos Descargables" : "Downloadable Resources"}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {language === "es"
              ? "Acceso instantáneo al framework completo. Completa el formulario para recibir tu descarga."
              : "Instant access to the complete framework. Fill out the form to receive your download."}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resources List */}
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Download className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Lead Capture Form */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>
                  {language === "es" ? "Acceso Instantáneo" : "Instant Access"}
                </CardTitle>
                <CardDescription>
                  {language === "es"
                    ? "Completa el formulario para recibir todos los recursos en tu email"
                    : "Complete the form to receive all resources in your email"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leadSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {language === "es" ? "¡Revisa tu email!" : "Check your email!"}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === "es"
                        ? "Te hemos enviado el acceso a todos los recursos."
                        : "We've sent you access to all resources."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleLeadSubmit(e, "All Resources Package")} className="space-y-4">
                    <div>
                      <Label htmlFor="lead-name">{language === "es" ? "Nombre" : "Name"} *</Label>
                      <Input
                        id="lead-name"
                        required
                        value={leadFormData.name}
                        onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-email">{language === "es" ? "Email Corporativo" : "Corporate Email"} *</Label>
                      <Input
                        id="lead-email"
                        type="email"
                        required
                        value={leadFormData.email}
                        onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-company">{language === "es" ? "Empresa" : "Company"} *</Label>
                      <Input
                        id="lead-company"
                        required
                        value={leadFormData.company}
                        onChange={(e) => setLeadFormData({ ...leadFormData, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-role">{language === "es" ? "Rol/Título" : "Role/Title"} *</Label>
                      <Select
                        value={leadFormData.role}
                        onValueChange={(value) => setLeadFormData({ ...leadFormData, role: value })}
                      >
                        <SelectTrigger id="lead-role">
                          <SelectValue placeholder={language === "es" ? "Selecciona tu rol" : "Select your role"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quality-manager">Quality Manager</SelectItem>
                          <SelectItem value="sqe">SQE / Supplier Quality Engineer</SelectItem>
                          <SelectItem value="director">Director / VP</SelectItem>
                          <SelectItem value="purchasing">Purchasing / Procurement</SelectItem>
                          <SelectItem value="compliance">Compliance / Regulatory</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead-company-size">{language === "es" ? "Tamaño de Empresa" : "Company Size"}</Label>
                      <Select
                        value={leadFormData.companySize}
                        onValueChange={(value) => setLeadFormData({ ...leadFormData, companySize: value })}
                      >
                        <SelectTrigger id="lead-company-size">
                          <SelectValue placeholder={language === "es" ? "Selecciona tamaño" : "Select size"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (&lt;50)</SelectItem>
                          <SelectItem value="medium">Mediana (50-500)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (&gt;500)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead-industry">{language === "es" ? "Industria" : "Industry"}</Label>
                      <Select
                        value={leadFormData.industry}
                        onValueChange={(value) => setLeadFormData({ ...leadFormData, industry: value })}
                      >
                        <SelectTrigger id="lead-industry">
                          <SelectValue placeholder={language === "es" ? "Selecciona industria" : "Select industry"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical-device">Medical Device</SelectItem>
                          <SelectItem value="combination-products">Combination Products</SelectItem>
                          <SelectItem value="biotech">Biotech</SelectItem>
                          <SelectItem value="pharma">Pharma</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead-challenge">{language === "es" ? "Desafío Principal" : "Main Challenge"}</Label>
                      <Select
                        value={leadFormData.mainChallenge}
                        onValueChange={(value) => setLeadFormData({ ...leadFormData, mainChallenge: value })}
                      >
                        <SelectTrigger id="lead-challenge">
                          <SelectValue placeholder={language === "es" ? "Selecciona desafío" : "Select challenge"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regulatory-compliance">Regulatory Compliance</SelectItem>
                          <SelectItem value="erp-integration">ERP Integration</SelectItem>
                          <SelectItem value="supplier-management">Supplier Management</SelectItem>
                          <SelectItem value="digital-transformation">Digital Transformation</SelectItem>
                          <SelectItem value="audit-preparation">Audit Preparation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-background p-4 rounded-lg border border-border">
                      <p className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        {language === "es" ? "Incluye:" : "Includes:"}
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>✓ 40+ páginas de experiencia práctica</li>
                        <li>✓ Templates de evaluación de proveedores</li>
                        <li>✓ Guías de configuración SAP</li>
                        <li>✓ Checklists de compliance</li>
                      </ul>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmittingLead}>
                      {isSubmittingLead
                        ? (language === "es" ? "Enviando..." : "Sending...")
                        : (language === "es" ? "Obtener Acceso Instantáneo" : "Get Instant Access")}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-secondary/5">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">
                {language === "es" ? "¿Tienes una consulta específica?" : "Have a specific inquiry?"}
              </CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Envíanos un mensaje y te responderemos en breve"
                  : "Send us a message and we'll get back to you soon"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="contact-name">{language === "es" ? "Nombre" : "Name"} *</Label>
                  <Input
                    id="contact-name"
                    required
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-message">{language === "es" ? "Mensaje" : "Message"} *</Label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={contactFormData.message}
                    onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmittingContact}>
                  {isSubmittingContact
                    ? (language === "es" ? "Enviando..." : "Sending...")
                    : (language === "es" ? "Enviar Consulta" : "Send Inquiry")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8 space-y-4">
            <Button variant="outline" size="lg">
              {language === "es" ? "Agenda una consulta gratuita de 30 minutos" : "Schedule a free 30-minute consultation"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Consulting;
