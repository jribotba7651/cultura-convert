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
  Settings
} from "lucide-react";

const ProfessionalProfile = () => {
  const { language } = useLanguage();

  const expertiseAreas = [
    {
      icon: Database,
      title: "SAP Master Data",
      items: ["Material Master", "Customer & Vendor", "ICPB Management", "Lifecycle Governance"]
    },
    {
      icon: Shield,
      title: "Data Governance",
      items: ["RACI Frameworks", "Data Quality Rules", "Workflows & Controls", "MOC Alignment"]
    },
    {
      icon: Rocket,
      title: "S/4HANA Migration",
      items: ["Data Cleansing", "Mapping & Templates", "Cutover Readiness", "Parallel Run Governance"]
    },
    {
      icon: BarChart3,
      title: "Supply Chain Analytics",
      items: ["SQL & Excel", "MRP Parameters", "Demand Planning", "Inventory Health"]
    }
  ];

  const projectHighlights = [
    {
      title: "SAP S/4HANA Migration",
      company: "Nutrawise Health & Beauty",
      description: "Led full master data workstream for transition from xTuple to SAP S/4HANA, designing templates for Material Master, BOMs, Vendors, and Inventory.",
      achievements: ["Built data migration rules", "Created governance model for parallel run", "Developed lifecycle framework"]
    },
    {
      title: "Customer Master Cleanup",
      company: "Nutrawise",
      description: "Comprehensive customer master data review and optimization project.",
      achievements: ["603 records reviewed", "104 active customers identified", "Data quality improved significantly"]
    },
    {
      title: "BOM/UOM Standardization",
      company: "Multiple Organizations",
      description: "Directed BOM restructuring and UOM standardization to support S/4HANA conversion across manufacturing operations.",
      achievements: ["Standardized UOM governance", "BOM restructuring for conversion", "Cross-functional alignment"]
    },
    {
      title: "Master Data Governance - LATAM",
      company: "Duracell",
      description: "Led customer and material master data strategy across Latin America, managing cross-regional supply chain data standards.",
      achievements: ["Reduced obsolete inventory by $3M+", "Cross-regional data standards", "Planning optimization"]
    },
    {
      title: "SAP MM/WM Support",
      company: "NGK Spark Plugs North America",
      description: "Supported SAP MM, WM for MRP, PO, GR, HU management, and outbound deliveries.",
      achievements: ["Internal SAP consultant", "Training & gap analysis", "Process troubleshooting"]
    }
  ];

  const consultingServices = [
    "Material Master cleanup & optimization",
    "BOM/UOM advisory & standardization",
    "S/4HANA readiness assessment",
    "Governance framework design",
    "Data quality rules definition",
    "Migration checklists & templates",
    "SOP development & documentation",
    "Training program outlines"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
              {language === 'es' ? 'Perfil Profesional' : 'Professional Profile'}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Juan C. Ribot-Guzman
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-primary">
              SAP Master Data & Data Governance Leader
            </p>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              15+ years in Master Data, Supply Chain Operations, and ERP Transformations
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Badge variant="outline" className="text-sm">SAP S/4HANA</Badge>
              <Badge variant="outline" className="text-sm">Master Data Management</Badge>
              <Badge variant="outline" className="text-sm">Data Governance</Badge>
              <Badge variant="outline" className="text-sm">Supply Chain</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            {language === 'es' ? 'Sobre Mí' : 'About Me'}
          </h2>
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                Senior Master Data and SAP professional with over 15 years of experience in regulated manufacturing, 
                medical devices, CPG, and high-tech environments. I've had the privilege of contributing to major 
                organizations including <span className="text-foreground font-medium">Nutrawise Health & Beauty</span>, 
                <span className="text-foreground font-medium"> Johnson & Johnson</span>, 
                <span className="text-foreground font-medium"> Skyworks Solutions</span>, 
                <span className="text-foreground font-medium"> Duracell</span>, and 
                <span className="text-foreground font-medium"> Procter & Gamble</span>.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                My expertise spans SAP S/4HANA migration leadership, comprehensive data governance frameworks, 
                BOM/UOM restructuring, and cross-functional collaboration across global teams. I specialize in 
                master data execution, cleansing, and validation for large-scale ERP transformations.
              </p>
              <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-foreground font-medium">
                  {language === 'es' 
                    ? 'Disponible para oportunidades remotas a tiempo completo' 
                    : 'Open to full-time remote opportunities'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SAP Expertise Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            {language === 'es' ? 'Experiencia SAP – Lo Que Hago' : 'SAP Expertise – What I Do'}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {language === 'es' 
              ? 'Especialización en gestión de datos maestros y transformación ERP'
              : 'Specialization in master data management and ERP transformation'}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertiseAreas.map((area, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <area.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {area.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Highlights Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            {language === 'es' ? 'Proyectos Destacados' : 'Project Highlights'}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {language === 'es' 
              ? 'Casos de éxito en transformación de datos y sistemas ERP'
              : 'Success stories in data transformation and ERP systems'}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectHighlights.map((project, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="text-xs">{project.company}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <ul className="space-y-1.5">
                    {project.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Download Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-3xl text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            {language === 'es' ? 'Descarga Mi Currículum' : 'Download My Résumé'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'es' 
              ? 'Obtén una copia completa de mi experiencia profesional y logros'
              : 'Get a complete copy of my professional experience and achievements'}
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="/downloads/Juan-C-Ribot-Resume.docx" download>
              <Download className="h-5 w-5" />
              {language === 'es' ? 'Descargar Currículum' : 'Download Résumé'}
            </a>
          </Button>
        </div>
      </section>

      {/* Consulting Services Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {language === 'es' ? 'Consultoría SAP Master Data' : 'SAP Master Data Consulting'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'es' 
                ? 'Ofrezco servicios de consultoría basados en más de 15 años de experiencia práctica en gestión de datos maestros SAP, gobernanza de datos y transformaciones ERP. Estos servicios están diseñados para ayudar a las organizaciones a optimizar sus procesos de datos y prepararse para migraciones exitosas.'
                : 'I offer consulting services based on over 15 years of hands-on experience in SAP master data management, data governance, and ERP transformations. These services are designed to help organizations optimize their data processes and prepare for successful migrations.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {consultingServices.map((service, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{service}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/consulting">
                {language === 'es' ? 'Ver Más Servicios' : 'View More Services'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            {language === 'es' ? 'Contacto' : 'Contact'}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {language === 'es' 
              ? 'Disponible para oportunidades remotas de SAP Master Data y Data Governance.'
              : 'Available for remote SAP Master Data and Data Governance opportunities.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
              <a href="mailto:jribot@gmail.com">
                <Mail className="h-5 w-5" />
                jribot@gmail.com
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <a href="https://www.linkedin.com/in/jcribot" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5" />
                LinkedIn Profile
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            📍 Irvine, CA | 📱 787.361.8323
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 text-center">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} Juan C. Ribot-Guzman. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default ProfessionalProfile;
