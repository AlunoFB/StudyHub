import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Brain, Trophy, Target, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <span className="text-xl font-heading font-bold tracking-tight">StudyHub FB</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                data-testid="theme-toggle-btn"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Link to="/auth">
                <Button data-testid="landing-login-btn">Entrar</Button>
              </Link>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
                Alternar tema
              </Button>
              <Link to="/auth" className="block">
                <Button className="w-full">Entrar</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-tight">
                Domine o vestibular com
                <span className="text-primary"> inteligência artificial</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Plataforma completa de estudos com questões estilo Farias Brito, análise de desempenho e recomendações personalizadas por IA.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto" data-testid="hero-get-started-btn">
                    Começar agora
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver demonstração
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-xl overflow-hidden border border-border/50 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1767102060241-130cb9260718?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBmb2N1c2VkJTIwbGlicmFyeXxlbnwwfHx8fDE3Njk0NDE1ODB8MA&ixlib=rb-4.1.0&q=85"
                  alt="Student studying"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary/20 rounded-lg blur-3xl"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/20 rounded-lg blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-4">
              Tudo que você precisa para ser aprovado
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas para transformar sua preparação
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-smooth">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2">Banco de Questões</h3>
              <p className="text-muted-foreground text-sm">
                Milhares de questões estilo vestibular organizadas por matéria e dificuldade.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-smooth">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2">Análise com IA</h3>
              <p className="text-muted-foreground text-sm">
                Identifique seus pontos fracos e receba recomendações personalizadas.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-smooth">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2">Ranking</h3>
              <p className="text-muted-foreground text-sm">
                Compare seu desempenho e compete com outros estudantes.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-smooth">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2">Metas Semanais</h3>
              <p className="text-muted-foreground text-sm">
                Defina objetivos e acompanhe seu progresso semana a semana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-4">
            Pronto para acelerar seus estudos?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se a milhares de estudantes que já estão usando o StudyHub FB
          </p>
          <Link to="/auth">
            <Button size="lg" data-testid="cta-start-btn">
              Criar conta gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2025 StudyHub FB. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;