import AuthorProfile from "@/components/AuthorProfile";
import LanguageToggle from "@/components/LanguageToggle";

const Index = () => {
  const juanBooks = [
    {
      title: "Cartas de Newark",
      description: "Una novela epistolar que revela la distancia entre promesas y realidades. Gregorio, desde Newark, escribe cartas que nunca envía a su madre en Puerto Rico, mientras ella construye bloque a bloque una casa esperando su regreso. Una historia conmovedora sobre familia, exilio y las verdades que nunca llegan a tiempo.",
      status: "published" as const
    },
    {
      title: "Divided Hearts",
      description: "Charlotte Valdez and Diego Herrera navigate the fault lines of privilege, policing, and identity in contemporary Orange County, told in alternating first-person voices.",
      status: "coming-soon" as const
    },
    {
      title: "Raíces en tierra ajena",
      description: "Una familia colombiana en Kenner enfrenta redadas migratorias y la tensa empatía de una familia estadounidense conservadora.",
      status: "coming-soon" as const
    }
  ];

  const rosnelmaBooks = [
    {
      title: "Isabel y Sofía: Hermanas Diferentes, Corazones Unidos",
      description: "Un libro infantil que explora la identidad, la familia y la imaginación a través de la historia de dos hermanas con personalidades únicas pero corazones unidos.",
      status: "published" as const
    },
    {
      title: "Las Aventuras de Luna y Avo",
      description: "Proyectos narrativos que integran ciencia, fantasía y vida cotidiana, diseñados para conectar con lectores de todas las edades.",
      status: "published" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Escritores Puertorriqueños
            </h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Voces que conectan{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                dos tierras
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Historias que exploran la migración, la memoria y el amor inquebrantable 
              de quienes construyen hogares entre culturas.
            </p>
          </div>
        </div>
      </section>

      {/* Authors Section */}
      <section className="py-16">
        <div className="container">
          <div className="space-y-20">
            <AuthorProfile
              name="Juan C. Ribot Guzmán"
              bio="Escritor puertorriqueño radicado en California. Su obra explora la migración, la memoria y el amor inquebrantable de quienes construyen hogares entre dos tierras."
              books={juanBooks}
            />
            
            <div className="border-t border-muted/20 pt-16">
              <AuthorProfile
                name="Rosnelma García Amalbert"
                bio="Escritora puertorriqueña y cofundadora de Jíbaros en la Luna, LLC. Combina su formación en administración y su pasión por la creatividad para dar vida a historias que exploran la identidad, la familia y la imaginación. Vive en California junto a su familia, desde donde impulsa iniciativas literarias y proyectos digitales con el propósito de conectar con lectores de todas las edades."
                books={rosnelmaBooks}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 Escritores Puertorriqueños. Historias que trascienden fronteras.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
