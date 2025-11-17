import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Download, ExternalLink, Star, GitFork, Clock } from "lucide-react";
import { Helmet } from "react-helmet";

interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

interface Project {
  id: string;
  repo: string;
  type: "chrome-extension" | "desktop-app";
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  downloadUrl?: string;
  installUrl?: string;
  techStack: string[];
  featured?: boolean;
}

const projects: Project[] = [
  {
    id: "tic-tac-toe",
    repo: "",
    type: "desktop-app",
    title: {
      es: "Tic-Tac-Toe Familiar",
      en: "Family Tic-Tac-Toe"
    },
    description: {
      es: "App de Tic-Tac-Toe diseñada para tiempo de calidad en familia. Colorida, con anuncios mínimos y sin música molesta.",
      en: "Tic-Tac-Toe app designed for quality family time. Colorful, minimal ads, and no annoying music."
    },
    downloadUrl: "/tic-tac-toe-support",
    techStack: ["React Native", "iOS", "Family Gaming"],
    featured: true
  },
  {
    id: "sql-formatter",
    repo: "jribotba7651/sql-formatter-chrome-extension",
    type: "chrome-extension",
    title: {
      es: "SQL Formatter",
      en: "SQL Formatter"
    },
    description: {
      es: "Formateo y embellecimiento de código SQL con syntax highlighting y auto-indentación",
      en: "SQL code formatting and beautification with syntax highlighting and auto-indentation"
    },
    installUrl: "https://chromewebstore.google.com/detail/sql-formatter-beautifier/epphaffkhphbolhifmndbpnplkpfadbh",
    techStack: ["JavaScript", "Chrome API", "SQL"],
    featured: true
  },
  {
    id: "excel-span",
    repo: "jribotba7651/ExcelSpanUtility",
    type: "desktop-app",
    title: {
      es: "Excel Span Utility",
      en: "Excel Span Utility"
    },
    description: {
      es: "Gestor de ventanas Excel para múltiples monitores con controles avanzados",
      en: "Excel window manager for multiple monitors with advanced controls"
    },
    downloadUrl: "https://github.com/jribotba7651/ExcelSpanUtility/releases",
    techStack: ["C#", "WPF", ".NET"],
    featured: true
  },
  {
    id: "markup-tool",
    repo: "jribotba7651/jibaro-markup-tool",
    type: "chrome-extension",
    title: {
      es: "Jíbaro Markup Tool",
      en: "Jíbaro Markup Tool"
    },
    description: {
      es: "Anotación y resaltado de texto con capacidad de exportar a HTML",
      en: "Text annotation and highlighting with HTML export capability"
    },
    installUrl: "https://chrome.google.com/webstore", // Update with actual URL
    techStack: ["JavaScript", "Chrome API", "HTML/CSS"],
    featured: false
  }
];

const Projects = () => {
  const { t, language } = useLanguage();
  const [repoData, setRepoData] = useState<Record<string, GitHubRepo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const promises = projects.map(async (project) => {
          const response = await fetch(`https://api.github.com/repos/${project.repo}`);
          if (response.ok) {
            const data = await response.json();
            return { [project.id]: data };
          }
          return null;
        });

        const results = await Promise.all(promises);
        const data = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setRepoData(data);
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>{language === 'es' ? 'Proyectos Open Source - Herramientas de Desarrollo' : 'Open Source Projects - Development Tools'} | Jíbaro en la Luna</title>
        <meta 
          name="description" 
          content={language === 'es' 
            ? 'Herramientas gratuitas y utilidades de código abierto para desarrolladores. Extensiones de Chrome y aplicaciones de escritorio.' 
            : 'Free tools and open source utilities for developers. Chrome extensions and desktop applications.'
          } 
        />
        <meta name="keywords" content={language === 'es' 
          ? 'herramientas desarrollador, utilidades gratis, extensiones chrome, sql formatter, excel utility, open source' 
          : 'developer tools, free utilities, chrome extensions, sql formatter, excel utility, open source'
        } />
        <link rel="canonical" href="https://jibaroenlaluna.com/proyectos" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-orange-50/50 to-background">
          <div className="container mx-auto max-w-7xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 font-semibold">
              <Github className="h-4 w-4" />
              Open Source
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('projectsTitle')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('projectsSubtitle')}
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => {
                const repo = repoData[project.id];
                
                return (
                  <Card 
                    key={project.id} 
                    className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 relative overflow-hidden"
                  >
                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge variant="default" className="bg-gradient-to-r from-orange-500 to-primary text-white shadow-lg">
                          {language === 'es' ? 'DESTACADO' : 'FEATURED'}
                        </Badge>
                      </div>
                    )}

                    {/* Decorative gradient */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-500 to-primary" />

                    <CardHeader className="pt-8">
                      <div className="flex items-start gap-3 mb-4">
                        {/* Type Badge */}
                        <Badge 
                          variant="outline" 
                          className="bg-primary/5 text-primary border-primary/20"
                        >
                          {project.type === 'chrome-extension' ? t('chromeExtension') : t('desktopApp')}
                        </Badge>
                      </div>

                      <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                        {project.title[language]}
                      </CardTitle>
                      
                      <CardDescription className="text-base leading-relaxed min-h-[60px]">
                        {project.description[language]}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Tech Stack */}
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">
                          {t('techStack')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech) => (
                            <Badge 
                              key={tech} 
                              variant="secondary"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* GitHub Stats */}
                      {loading ? (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{t('loading')}</span>
                        </div>
                      ) : repo ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              <span>{repo.stargazers_count} {t('stars')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="h-4 w-4" />
                              <span>{repo.forks_count} {t('forks')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{t('lastUpdate')}: {formatDate(repo.updated_at)}</span>
                          </div>
                        </div>
                      ) : null}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button 
                          variant="default"
                          className="flex-1 group-hover:shadow-lg transition-shadow"
                          asChild
                        >
                          <a 
                            href={`https://github.com/${project.repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-4 w-4 mr-2" />
                            {t('viewOnGitHub')}
                          </a>
                        </Button>
                        
                        {project.type === 'chrome-extension' && project.installUrl && (
                          <Button 
                            variant="outline"
                            className="flex-1 hover:bg-primary hover:text-primary-foreground"
                            asChild
                          >
                            <a 
                              href={project.installUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {t('install')}
                            </a>
                          </Button>
                        )}
                        
                        {project.type === 'desktop-app' && project.downloadUrl && (
                          <Button 
                            variant="outline"
                            className="flex-1 hover:bg-primary hover:text-primary-foreground"
                            asChild
                          >
                            <a 
                              href={project.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('download')}
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-orange-500/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {language === 'es' ? '¿Interesado en contribuir?' : 'Interested in contributing?'}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {language === 'es' 
                ? 'Todos estos proyectos son open source. ¡Las contribuciones son bienvenidas!' 
                : 'All these projects are open source. Contributions are welcome!'}
            </p>
            <Button 
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
              asChild
            >
              <a 
                href="https://github.com/jribotba7651"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5 mr-2" />
                {language === 'es' ? 'Ver más en GitHub' : 'See more on GitHub'}
              </a>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Projects;
