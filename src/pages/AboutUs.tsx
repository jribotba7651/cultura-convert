import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Shield, 
  Rocket, 
  BarChart3, 
  Download, 
  Mail, 
  Linkedin, 
  CheckCircle2,
  Building2,
  Users,
  FileText,
  Settings,
  Award,
  Microscope,
  ClipboardCheck,
  Factory
} from "lucide-react";
import juanProfessionalPhoto from "@/assets/juan-ribot-professional.jpg";
import rosnelmaProfilePhoto from "@/assets/rosnelma-garcia-profile.jpg";

const AboutUs = () => {
  const { language } = useLanguage();

  // Juan's expertise
  const juanExpertise = [
    {
      icon: Database,
      title: "SAP Master Data",
      items: language === 'es' 
        ? ["Material Master", "Cliente y Proveedor", "Gestión ICPB", "Gobernanza de Ciclo de Vida"]
        : ["Material Master", "Customer & Vendor", "ICPB Management", "Lifecycle Governance"]
    },
    {
      icon: Shield,
      title: language === 'es' ? "Gobernanza de Datos" : "Data Governance",
      items: language === 'es'
        ? ["Marcos RACI", "Reglas de Calidad de Datos", "Flujos de Trabajo", "Alineación MOC"]
        : ["RACI Frameworks", "Data Quality Rules", "Workflows & Controls", "MOC Alignment"]
    },
    {
      icon: Rocket,
      title: language === 'es' ? "Migración S/4HANA" : "S/4HANA Migration",
      items: language === 'es'
        ? ["Limpieza de Datos", "Mapeo y Plantillas", "Preparación de Cutover", "Gobernanza Paralela"]
        : ["Data Cleansing", "Mapping & Templates", "Cutover Readiness", "Parallel Run Governance"]
    },
    {
      icon: BarChart3,
      title: language === 'es' ? "Analítica de Supply Chain" : "Supply Chain Analytics",
      items: language === 'es'
        ? ["SQL y Excel", "Parámetros MRP", "Planificación de Demanda", "Salud de Inventario"]
        : ["SQL & Excel", "MRP Parameters", "Demand Planning", "Inventory Health"]
    }
  ];

  // Rosnelma's expertise
  const rosnelmaExpertise = [
    {
      icon: ClipboardCheck,
      title: language === 'es' ? "Gestión de Proveedores" : "Strategic Supplier Management",
      items: language === 'es'
        ? ["Calificación de Proveedores", "Métricas de Desempeño", "Evaluación de Riesgos", "Integración Global"]
        : ["Supplier Qualification", "Performance Metrics", "Risk Assessment", "Global Integration"]
    },
    {
      icon: Shield,
      title: "FDA/ISO 13485",
      items: language === 'es'
        ? ["Auditorías de Cuerpo Notificado", "Preparación para Inspecciones", "Cumplimiento Regulatorio", "Diseño de Controles"]
        : ["Notified Body Audits", "Inspection Readiness", "Regulatory Compliance", "Design Controls"]
    },
    {
      icon: Factory,
      title: language === 'es' ? "Dispositivos Médicos" : "Medical Devices",
      items: language === 'es'
        ? ["Clase II/III", "Productos Combinados", "Fases Clínicas PMA", "Controles de Compras"]
        : ["Class II/III Devices", "Combination Products", "Clinical PMA Phases", "Purchasing Controls"]
    },
    {
      icon: Award,
      title: language === 'es' ? "Sistemas CAPA" : "CAPA & Quality Systems",
      items: language === 'es'
        ? ["Gestión de CAPA", "No Conformidades", "Gestión de Cambios", "Optimización de Procesos"]
        : ["CAPA Management", "Nonconformance", "Change Management", "Process Optimization"]
    }
  ];

  // Juan's project highlights
  const juanProjects = [
    {
      title: language === 'es' ? "Migración SAP S/4HANA" : "SAP S/4HANA Migration",
      company: "Nutrawise Health & Beauty",
      description: language === 'es' 
        ? "Lideró la transición completa de datos maestros de xTuple a SAP S/4HANA."
        : "Led full master data workstream for transition from xTuple to SAP S/4HANA.",
      achievements: language === 'es'
        ? ["Reglas de migración", "Modelo de gobernanza", "Marco de ciclo de vida"]
        : ["Migration rules", "Governance model", "Lifecycle framework"]
    },
    {
      title: language === 'es' ? "Gobernanza LATAM" : "Master Data Governance - LATAM",
      company: "Duracell",
      description: language === 'es'
        ? "Lideró estrategia de datos maestros de clientes y materiales en Latinoamérica."
        : "Led customer and material master data strategy across Latin America.",
      achievements: language === 'es'
        ? ["$3M+ reducción de inventario", "Estándares regionales", "Optimización de planificación"]
        : ["$3M+ inventory reduction", "Regional standards", "Planning optimization"]
    }
  ];

  // Rosnelma's project highlights
  const rosnelmaProjects = [
    {
      title: language === 'es' ? "Liderazgo de Calidad de Proveedores" : "Supplier Quality Leadership",
      company: "MedAlliance – Cordis",
      description: language === 'es'
        ? "Construyó organización completa de Calidad y Cumplimiento de Proveedores desde cero."
        : "Built complete Supplier Quality & Compliance organization from inception.",
      achievements: language === 'es'
        ? ["Cero hallazgos en auditorías", "Reducción de 12-18 meses a 30 días", "Equipo de 4-8 ingenieros"]
        : ["Zero audit findings", "12-18 months to 30 days closure", "Team of 4-8 engineers"]
    },
    {
      title: language === 'es' ? "Integración de Adquisiciones" : "Acquisition Integration",
      company: "Medtronic",
      description: language === 'es'
        ? "Lideró plan de integración de gestión de proveedores para nuevas adquisiciones."
        : "Led Supplier Management Integration plan for new acquisitions.",
      achievements: language === 'es'
        ? ["Reconocida por VP Global", "Coaching de transición", "Roadmap estratégico"]
        : ["Recognized by Global VP", "Transition coaching", "Strategic roadmap"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" />
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
            {language === 'es' ? 'Nuestro Equipo' : 'Our Team'}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            {language === 'es' ? 'Nosotros' : 'About Us'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {language === 'es' 
              ? 'Combinamos más de 37 años de experiencia en SAP Master Data, Gobernanza de Datos, y Calidad de Proveedores en dispositivos médicos y manufactura.'
              : 'We combine over 37 years of experience in SAP Master Data, Data Governance, and Supplier Quality in medical devices and manufacturing.'}
          </p>
        </div>
      </section>

      {/* Juan's Profile Section */}
      <section id="juan-profile" className="py-20 px-4 scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-start gap-12 mb-16">
            {/* Photo & Basic Info */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl mx-auto lg:mx-0 mb-6">
                <img 
                  src={juanProfessionalPhoto} 
                  alt="Juan C. Ribot-Guzman" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Juan C. Ribot-Guzman
              </h2>
              <p className="text-lg font-semibold text-primary mb-3">
                SAP Master Data & Data Governance Leader
              </p>
              <p className="text-muted-foreground mb-4">
                {language === 'es' ? '15+ años de experiencia' : '15+ years of experience'}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                <Badge variant="outline" className="text-xs">SAP S/4HANA</Badge>
                <Badge variant="outline" className="text-xs">Master Data</Badge>
                <Badge variant="outline" className="text-xs">Supply Chain</Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start">
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <a href="mailto:jribot@gmail.com">
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <a href="https://www.linkedin.com/in/jcribot" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>

            {/* Bio & Experience */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {language === 'es' ? 'Experiencia Profesional' : 'Professional Background'}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {language === 'es' 
                  ? 'Profesional senior en Master Data y SAP con más de 15 años de experiencia en manufactura regulada, dispositivos médicos, CPG y entornos de alta tecnología. He contribuido a organizaciones importantes incluyendo Nutrawise Health & Beauty, Johnson & Johnson, Skyworks Solutions, Duracell y Procter & Gamble.'
                  : 'Senior Master Data and SAP professional with over 15 years of experience in regulated manufacturing, medical devices, CPG, and high-tech environments. I have contributed to major organizations including Nutrawise Health & Beauty, Johnson & Johnson, Skyworks Solutions, Duracell, and Procter & Gamble.'}
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {language === 'es'
                  ? 'Mi experiencia abarca liderazgo en migración SAP S/4HANA, marcos integrales de gobernanza de datos, reestructuración de BOM/UOM y colaboración multifuncional en equipos globales.'
                  : 'My expertise spans SAP S/4HANA migration leadership, comprehensive data governance frameworks, BOM/UOM restructuring, and cross-functional collaboration across global teams.'}
              </p>
              
              {/* Companies */}
              <div className="flex flex-wrap gap-3 mb-6">
                {['Nutrawise', 'Johnson & Johnson', 'Skyworks', 'Duracell', 'P&G'].map(company => (
                  <Badge key={company} variant="secondary" className="text-xs">
                    {company}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground">
                  {language === 'es' 
                    ? 'Disponible para oportunidades remotas a tiempo completo' 
                    : 'Open to full-time remote opportunities'}
                </p>
              </div>
            </div>
          </div>

          {/* Juan's Expertise Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {juanExpertise.map((area, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <area.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {area.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Juan's Projects */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {juanProjects.map((project, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <Badge variant="secondary" className="text-xs">{project.company}</Badge>
                  </div>
                  <CardTitle className="text-base">{project.title}</CardTitle>
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {project.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Juan's Resume Download */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <Button asChild className="gap-2">
              <a href="/downloads/Juan-C-Ribot-Resume.docx" download>
                <Download className="h-4 w-4" />
                {language === 'es' ? 'Descargar CV de Juan' : "Download Juan's Resume"}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-4xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Rosnelma's Profile Section */}
      <section id="rosnelma-profile" className="py-20 px-4 bg-muted/20 scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-start gap-12 mb-16">
            {/* Photo & Basic Info */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-secondary/30 shadow-xl mx-auto lg:mx-0 mb-6">
                <img 
                  src={rosnelmaProfilePhoto} 
                  alt="Rosnelma García-Amalbert" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Rosnelma García-Amalbert
              </h2>
              <p className="text-lg font-semibold text-primary mb-3">
                {language === 'es' ? 'Ejecutiva de Calidad de Proveedores' : 'Supplier Quality Executive'}
              </p>
              <p className="text-muted-foreground mb-4">
                {language === 'es' ? '22+ años de experiencia' : '22+ years of experience'}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                <Badge variant="outline" className="text-xs">FDA/ISO 13485</Badge>
                <Badge variant="outline" className="text-xs">{language === 'es' ? 'Dispositivos Médicos' : 'Medical Devices'}</Badge>
                <Badge variant="outline" className="text-xs">CAPA</Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start">
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <a href="mailto:rosnelma@gmail.com">
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <a href="https://www.linkedin.com/in/rosnelma" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>

            {/* Bio & Experience */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {language === 'es' ? 'Experiencia Profesional' : 'Professional Background'}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {language === 'es' 
                  ? 'Ejecutiva estratégica de Calidad de Proveedores con más de 22 años arquitectando marcos de gobernanza y liderando organizaciones de calidad en dispositivos médicos, productos combinados y operaciones farmacéuticas. Actualmente en rol de nivel director reportando directamente al VP de Calidad.'
                  : 'Strategic Supplier Quality executive with 22+ years architecting governance frameworks and leading quality organizations across medical devices, combination products, and pharmaceutical operations. Currently serving in director-level capacity reporting directly to VP of Quality.'}
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {language === 'es'
                  ? 'Experiencia comprobada construyendo organizaciones de Calidad y Cumplimiento de Proveedores desde cero, transformando la gobernanza de proveedores en funciones integradas y proactivas que aceleran la comercialización mientras fortalecen la preparación para inspecciones.'
                  : 'Proven expertise building Supplier Quality & Compliance organizations from inception, transforming supplier governance into integrated, proactive functions that accelerate commercialization while strengthening inspection readiness.'}
              </p>
              
              {/* Companies */}
              <div className="flex flex-wrap gap-3 mb-6">
                {['MedAlliance-Cordis', 'Medtronic', 'Cardinal Health', 'Pfizer', 'Lilly'].map(company => (
                  <Badge key={company} variant="secondary" className="text-xs">
                    {company}
                  </Badge>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-2 mb-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">MBA</span> - University of Phoenix (HR Specialization)
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">BSEE</span> - University of Puerto Rico at Mayagüez
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground">
                  {language === 'es' 
                    ? 'Disponible para oportunidades de liderazgo en calidad' 
                    : 'Available for quality leadership opportunities'}
                </p>
              </div>
            </div>
          </div>

          {/* Rosnelma's Expertise Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {rosnelmaExpertise.map((area, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                    <area.icon className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-base">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {area.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-secondary/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rosnelma's Projects */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {rosnelmaProjects.map((project, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <Badge variant="secondary" className="text-xs">{project.company}</Badge>
                  </div>
                  <CardTitle className="text-base">{project.title}</CardTitle>
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {project.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rosnelma's Resume Download */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <Button asChild className="gap-2">
              <a href="/downloads/Rosnelma-Garcia-Resume.docx" download>
                <Download className="h-4 w-4" />
                {language === 'es' ? 'Descargar CV de Rosnelma' : "Download Rosnelma's Resume"}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <Users className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            {language === 'es' ? '¿Trabajemos Juntos?' : 'Work With Us?'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'es' 
              ? 'Disponibles para oportunidades de consultoría y empleo en SAP Master Data, Data Governance y Supplier Quality.'
              : 'Available for consulting and employment opportunities in SAP Master Data, Data Governance, and Supplier Quality.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/consulting">
                {language === 'es' ? 'Ver Servicios de Consultoría' : 'View Consulting Services'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/#contact">
                {language === 'es' ? 'Contactar' : 'Contact Us'}
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            📍 Irvine, CA
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 text-center">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} Juan C. Ribot-Guzman & Rosnelma García-Amalbert
        </p>
      </footer>
    </div>
  );
};

export default AboutUs;
