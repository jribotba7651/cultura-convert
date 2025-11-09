import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  // EDITA AQUÍ LAS DESCRIPCIONES DETALLADAS (200-300 palabras cada una)
  const services = [
    {
      icon: Shield,
      title: {
        es: "Regulatory Compliance Consulting",
        en: "Regulatory Compliance Consulting"
      },
      description: {
        es: "Implementación de FDA 21 CFR 820.50, ISO 13485, EU MDR; compliance para productos combinados; estrategia y documentación regulatoria; preparación y remediación de auditorías.",
        en: "FDA 21 CFR 820.50, ISO 13485, EU MDR implementation; combination product compliance; regulatory strategy and documentation; audit preparation and remediation."
      },
      detailedDescription: {
        es: "Nuestros servicios de Consultoría en Cumplimiento Regulatorio ayudan a las organizaciones a navegar los complejos requisitos de la industria de dispositivos médicos y productos combinados. Con más de 22 años de experiencia, ofrecemos implementación completa de sistemas de gestión de calidad bajo FDA 21 CFR Part 820.50, ISO 13485:2016 y EU MDR 2017/745.\n\nNuestro enfoque incluye desarrollo de estrategias regulatorias personalizadas, documentación de procesos críticos, establecimiento de controles de calidad robustos, y preparación integral para auditorías de FDA, ISO y Notified Bodies. Trabajamos mano a mano con equipos de Quality, Regulatory Affairs, Operations e Ingeniería para asegurar que los sistemas de compliance no solo cumplan requisitos normativos sino que también agreguen valor operativo.\n\nEspecialización en productos combinados (device-drug, device-biologic), donde navegamos los requisitos duales de CDER/CBER y CDRH. Servicios de remediación post-auditoría incluyendo análisis de observaciones FDA 483, Warning Letters, y desarrollo de planes CAPA efectivos.",
        en: "Our Regulatory Compliance Consulting services help organizations navigate the complex requirements of the medical device and combination products industry. With over 22 years of experience, we offer complete implementation of quality management systems under FDA 21 CFR Part 820.50, ISO 13485:2016, and EU MDR 2017/745.\n\nOur approach includes development of customized regulatory strategies, documentation of critical processes, establishment of robust quality controls, and comprehensive preparation for FDA, ISO, and Notified Body audits. We work hand-in-hand with Quality, Regulatory Affairs, Operations, and Engineering teams to ensure compliance systems not only meet regulatory requirements but also add operational value.\n\nSpecialization in combination products (device-drug, device-biologic), where we navigate dual requirements from CDER/CBER and CDRH. Post-audit remediation services including FDA 483 observation analysis, Warning Letters, and development of effective CAPA plans."
      }
    },
    {
      icon: FileCheck,
      title: {
        es: "Digital Quality Management Systems (eQMS)",
        en: "Digital Quality Management Systems (eQMS)"
      },
      description: {
        es: "Transformación digital de procesos de calidad, integración bidireccional ERP–eQMS, controles de cumplimiento automatizados, monitorización en tiempo real.",
        en: "Digital transformation of quality processes, bidirectional ERP-eQMS integration, automated compliance controls, real-time monitoring."
      },
      detailedDescription: {
        es: "Lideramos la transformación digital de sistemas de gestión de calidad, convirtiendo procedimientos manuales en controles automatizados que mejoran compliance y eficiencia operativa. Nuestra experiencia abarca implementación completa de plataformas eQMS (TrackWise, MasterControl, Veeva QualityOne, Arena) con enfoque en integración bidireccional con sistemas ERP (SAP, Oracle, Microsoft Dynamics).\n\nDiseñamos workflows automatizados para Document Control, Change Control, CAPA, Non-Conformances, Supplier Quality, Training Management y Audit Management. Implementamos controles en tiempo real que previenen desviaciones antes de que ocurran, reduciendo el riesgo de observaciones regulatorias.\n\nNuestra metodología incluye mapeo de procesos actuales, identificación de pain points, diseño de estado futuro, configuración de sistema, validación según 21 CFR Part 11, migración de datos históricos, capacitación de usuarios y soporte post-implementación. Creamos dashboards ejecutivos y KPIs para monitorización continua del desempeño del sistema de calidad.",
        en: "We lead the digital transformation of quality management systems, converting manual procedures into automated controls that improve compliance and operational efficiency. Our experience spans complete implementation of eQMS platforms (TrackWise, MasterControl, Veeva QualityOne, Arena) with focus on bidirectional integration with ERP systems (SAP, Oracle, Microsoft Dynamics).\n\nWe design automated workflows for Document Control, Change Control, CAPA, Non-Conformances, Supplier Quality, Training Management, and Audit Management. We implement real-time controls that prevent deviations before they occur, reducing the risk of regulatory observations.\n\nOur methodology includes current state process mapping, pain point identification, future state design, system configuration, validation per 21 CFR Part 11, historical data migration, user training, and post-implementation support. We create executive dashboards and KPIs for continuous monitoring of quality system performance."
      }
    },
    {
      icon: TrendingUp,
      title: {
        es: "Supply Chain Risk Management",
        en: "Supply Chain Risk Management"
      },
      description: {
        es: "Clasificación y seguimiento de proveedores según riesgo, planes de continuidad del negocio, mitigación de proveedores únicos, programas de auditoría y gestión de acciones correctivas.",
        en: "Risk-based supplier classification and tracking, business continuity plans, single source mitigation, audit programs and corrective action management."
      },
      detailedDescription: {
        es: "Desarrollamos programas integrales de gestión de riesgos en la cadena de suministro, críticos para cumplimiento regulatorio y continuidad operativa en la industria de dispositivos médicos. Implementamos sistemas de clasificación de proveedores basados en riesgo (critical/major/minor) alineados con FDA 21 CFR 820.50 e ISO 13485:2016.\n\nNuestros servicios incluyen desarrollo de Approved Supplier Lists (ASL) en ERP, establecimiento de requisitos de calificación por categoría de riesgo, diseño de programas de auditoría (on-site, remote, desktop), gestión de Supplier CAPAs, y monitorización continua de desempeño mediante scorecards.\n\nEspecialización en mitigación de single-source suppliers mediante estrategias de dual sourcing, qualification de proveedores alternativos, y planes de continuidad de negocio. Implementamos controles automatizados en ERP para prevenir compras de proveedores no aprobados, gestión de quality agreements, y trazabilidad completa de componentes críticos. Desarrollamos dashboards de riesgo de supply chain y establecemos comités multifuncionales de governance.",
        en: "We develop comprehensive supply chain risk management programs, critical for regulatory compliance and operational continuity in the medical device industry. We implement risk-based supplier classification systems (critical/major/minor) aligned with FDA 21 CFR 820.50 and ISO 13485:2016.\n\nOur services include development of Approved Supplier Lists (ASL) in ERP, establishment of qualification requirements by risk category, design of audit programs (on-site, remote, desktop), Supplier CAPA management, and continuous performance monitoring through scorecards.\n\nSpecialization in single-source supplier mitigation through dual sourcing strategies, alternative supplier qualification, and business continuity plans. We implement automated controls in ERP to prevent purchases from non-approved suppliers, quality agreement management, and complete traceability of critical components. We develop supply chain risk dashboards and establish multifunctional governance committees."
      }
    },
    {
      icon: Users,
      title: {
        es: "Cross-Functional Process Optimization",
        en: "Cross-Functional Process Optimization"
      },
      description: {
        es: "Alineamiento Calidad–Compras–Ingeniería, integración de change control entre departamentos, diseño de jerarquía documental, liderazgo de equipos multifuncionales.",
        en: "Quality-Purchasing-Engineering alignment, cross-departmental change control integration, document hierarchy design, multifunctional team leadership."
      },
      detailedDescription: {
        es: "Optimizamos procesos que cruzan múltiples departamentos, eliminando silos organizacionales y mejorando eficiencia operativa mientras mantenemos cumplimiento regulatorio. Especializados en alinear Quality Assurance, Purchasing/Procurement, Engineering, Regulatory Affairs y Operations mediante workflows integrados.\n\nDesarrollamos sistemas de change control que conectan Engineering Changes (ECO/ECN) con Supplier Changes, Document Changes, y Training requirements, asegurando que todos los stakeholders participen en el momento correcto del proceso. Implementamos jerarquías documentales coherentes (Policies, SOPs, Work Instructions, Forms) con roles y responsabilidades claros.\n\nLideramos equipos multifuncionales para proyectos complejos como transferencias de manufactura, validaciones de proceso, cambios de supplier críticos, y lanzamientos de nuevos productos. Facilitamos resolución de conflictos entre departamentos, establecemos KPIs compartidos, y creamos culture de calidad y colaboración. Nuestro enfoque combina lean methodologies, risk management, y regulatory compliance para entregar mejoras sostenibles.",
        en: "We optimize processes that span multiple departments, eliminating organizational silos and improving operational efficiency while maintaining regulatory compliance. Specialized in aligning Quality Assurance, Purchasing/Procurement, Engineering, Regulatory Affairs, and Operations through integrated workflows.\n\nWe develop change control systems that connect Engineering Changes (ECO/ECN) with Supplier Changes, Document Changes, and Training requirements, ensuring all stakeholders participate at the right time in the process. We implement coherent document hierarchies (Policies, SOPs, Work Instructions, Forms) with clear roles and responsibilities.\n\nWe lead multifunctional teams for complex projects such as manufacturing transfers, process validations, critical supplier changes, and new product launches. We facilitate conflict resolution between departments, establish shared KPIs, and create a culture of quality and collaboration. Our approach combines lean methodologies, risk management, and regulatory compliance to deliver sustainable improvements."
      }
    },
    {
      icon: Award,
      title: {
        es: "Industry-Specific Expertise",
        en: "Industry-Specific Expertise"
      },
      description: {
        es: "Más de 22 años de experiencia en empresas multinacionales y startups de dispositivos médicos, productos combinados y biotecnología.",
        en: "22+ years of experience in multinational companies and startups in medical devices, combination products, and biotechnology."
      },
      detailedDescription: {
        es: "Aportamos más de dos décadas de experiencia práctica en la industria altamente regulada de dispositivos médicos, productos combinados y biotecnología. Hemos trabajado tanto en corporaciones multinacionales Fortune 500 como en startups en fase de crecimiento, entendiendo los desafíos únicos de cada contexto organizacional.\n\nNuestra experiencia abarca todo el ciclo de vida del producto: desde I+D y validación de procesos, pasando por scale-up de manufactura y transferencias de tecnología, hasta gestión de productos comerciales maduros y obsolescencia. Profundo conocimiento de clasificaciones de dispositivos médicos (Clase I, II, III), rutas regulatorias (510(k), PMA, De Novo), y requisitos específicos de productos combinados.\n\nHemos liderado exitosamente preparaciones para inspecciones FDA, auditorías ISO 13485, certificaciones MDR/IVDR, y procesos de remediation post-warning letter. Experiencia hands-on implementando sistemas en empresas de implantes cardiovasculares, dispositivos ortopédicos, diagnóstico in-vitro, drug delivery systems, y terapias celulares. Esta profundidad de experiencia nos permite entregar soluciones prácticas y probadas, no teoría.",
        en: "We bring over two decades of hands-on experience in the highly regulated medical device, combination products, and biotechnology industry. We have worked in both Fortune 500 multinational corporations and growth-stage startups, understanding the unique challenges of each organizational context.\n\nOur experience spans the entire product lifecycle: from R&D and process validation, through manufacturing scale-up and technology transfers, to management of mature commercial products and obsolescence. Deep knowledge of medical device classifications (Class I, II, III), regulatory pathways (510(k), PMA, De Novo), and combination product-specific requirements.\n\nWe have successfully led preparations for FDA inspections, ISO 13485 audits, MDR/IVDR certifications, and post-warning letter remediation processes. Hands-on experience implementing systems in cardiovascular implant companies, orthopedic devices, in-vitro diagnostics, drug delivery systems, and cell therapies. This depth of experience allows us to deliver practical, proven solutions, not theory."
      }
    },
    {
      icon: Database,
      title: {
        es: "Master Data Governance & ERP Integration",
        en: "Master Data Governance & ERP Integration"
      },
      description: {
        es: "Frameworks de gobernanza, integración con SAP/ERP, configuración de vendor master controls y ASL, workflows de qualification y change control.",
        en: "Governance frameworks, SAP/ERP integration, vendor master controls and ASL configuration, qualification and change control workflows."
      },
      detailedDescription: {
        es: "Implementamos frameworks robustos de gobernanza de datos maestros, esenciales para mantener integridad de datos en sistemas ERP y cumplir con requisitos de data integrity bajo 21 CFR Part 11. Especializados en SAP (módulos MM, QM, PP), Oracle ERP, Microsoft Dynamics, pero con metodología agnóstica de plataforma.\n\nDesarrollamos Vendor Master Data governance incluyendo definición de data owners, procesos de creación/modificación/inactivación de suppliers, controles de aprobación por niveles de riesgo, y campos obligatorios específicos para compliance (certifications, registrations, quality agreements). Implementamos Approved Supplier Lists (ASL) con controles automatizados que previenen compras de fuentes no calificadas.\n\nCreamos workflows integrados entre eQMS y ERP para supplier qualification, change notifications, y CAPA tracking. Configuramos material master controls para componentes críticos, incluyendo specification management, approved manufacturer lists, y shelf-life tracking. Establecemos comités de Data Governance, métricas de calidad de datos (completeness, accuracy, timeliness), y procesos de data cleansing. Nuestro enfoque asegura que master data sea un enabler estratégico, no un obstáculo operativo.",
        en: "We implement robust master data governance frameworks, essential for maintaining data integrity in ERP systems and complying with data integrity requirements under 21 CFR Part 11. Specialized in SAP (MM, QM, PP modules), Oracle ERP, Microsoft Dynamics, but with platform-agnostic methodology.\n\nWe develop Vendor Master Data governance including definition of data owners, processes for supplier creation/modification/inactivation, approval controls by risk level, and compliance-specific mandatory fields (certifications, registrations, quality agreements). We implement Approved Supplier Lists (ASL) with automated controls that prevent purchases from non-qualified sources.\n\nWe create integrated workflows between eQMS and ERP for supplier qualification, change notifications, and CAPA tracking. We configure material master controls for critical components, including specification management, approved manufacturer lists, and shelf-life tracking. We establish Data Governance committees, data quality metrics (completeness, accuracy, timeliness), and data cleansing processes. Our approach ensures master data is a strategic enabler, not an operational obstacle."
      }
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
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{service.title[language]}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {service.description[language]}
                    </CardDescription>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          {language === "es" ? "Saber más" : "Learn More"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <DialogTitle className="text-2xl mb-4">{service.title[language]}</DialogTitle>
                          <DialogDescription className="text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                            {service.detailedDescription[language]}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                          <Button className="flex-1">
                            {language === "es" ? "Agendar Consulta" : "Schedule Consultation"}
                          </Button>
                          <Button variant="outline" className="flex-1">
                            {language === "es" ? "Descargar Recursos" : "Download Resources"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
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
                          <SelectItem value="medical-devices">Medical Devices</SelectItem>
                          <SelectItem value="combination-products">Combination Products</SelectItem>
                          <SelectItem value="pharma">Pharma / Biotech</SelectItem>
                          <SelectItem value="ivd">In-Vitro Diagnostics</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead-challenge">{language === "es" ? "Principal Desafío (opcional)" : "Main Challenge (optional)"}</Label>
                      <Textarea
                        id="lead-challenge"
                        rows={3}
                        value={leadFormData.mainChallenge}
                        onChange={(e) => setLeadFormData({ ...leadFormData, mainChallenge: e.target.value })}
                        placeholder={language === "es" ? "Cuéntanos tu mayor desafío..." : "Tell us your biggest challenge..."}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmittingLead}>
                      {isSubmittingLead
                        ? (language === "es" ? "Enviando..." : "Submitting...")
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
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            {language === "es" ? "¿Necesitas Asesoría Personalizada?" : "Need Personalized Consulting?"}
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            {language === "es"
              ? "Contáctanos para discutir cómo podemos ayudar a tu organización"
              : "Contact us to discuss how we can help your organization"}
          </p>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="contact-email">{language === "es" ? "Email" : "Email"} *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact-message">{language === "es" ? "Mensaje" : "Message"} *</Label>
                  <Textarea
                    id="contact-message"
                    rows={6}
                    required
                    value={contactFormData.message}
                    onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                    placeholder={language === "es" ? "Describe tu proyecto o necesidad..." : "Describe your project or need..."}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmittingContact}>
                  <Mail className="w-4 h-4 mr-2" />
                  {isSubmittingContact
                    ? (language === "es" ? "Enviando..." : "Sending...")
                    : (language === "es" ? "Enviar Consulta" : "Send Inquiry")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Consulting;
