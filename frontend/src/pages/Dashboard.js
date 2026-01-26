import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Trophy, Book, TrendingUp, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';

const Dashboard = ({ user, onLogout }) => {
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resultsRes, subjectsRes] = await Promise.all([
        api.get('/results'),
        api.get('/subjects')
      ]);
      
      setResults(resultsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await api.post('/ai/analyze', { user_id: user.id });
      setAiAnalysis(response.data);
      toast.success('Análise concluída!');
    } catch (error) {
      toast.error('Erro ao gerar análise');
    } finally {
      setAnalyzing(false);
    }
  };

  const totalQuestions = results.reduce((sum, r) => sum + r.total_questions, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.correct_answers, 0);
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const weeklyProgress = (totalQuestions / user.weekly_goal) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-2">
            Olá, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">Veja seu progresso e continue estudando</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Weekly Goal Card */}
          <Card className="md:col-span-2 lg:col-span-1" data-testid="weekly-goal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Meta Semanal
              </CardTitle>
              <CardDescription>{totalQuestions} de {user.weekly_goal} questões</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={Math.min(weeklyProgress, 100)} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {weeklyProgress >= 100 ? 'Meta atingida! 🎉' : `Faltam ${user.weekly_goal - totalQuestions} questões`}
              </p>
            </CardContent>
          </Card>

          {/* Overall Performance Card */}
          <Card data-testid="performance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Desempenho Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-heading font-bold font-mono mb-2">
                {overallAccuracy.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">
                {totalCorrect} acertos em {totalQuestions} questões
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card data-testid="quick-actions-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/questions">
                <Button className="w-full" data-testid="practice-questions-btn">
                  Resolver Questões
                </Button>
              </Link>
              <Link to="/ranking">
                <Button variant="outline" className="w-full">
                  <Trophy className="w-4 h-4 mr-2" />
                  Ver Ranking
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Subject */}
        <Card className="mb-8" data-testid="subjects-performance-card">
          <CardHeader>
            <CardTitle>Desempenho por Matéria</CardTitle>
            <CardDescription>
              {results.length === 0 ? 'Resolva questões para ver seu progresso' : 'Suas estatísticas detalhadas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma questão resolvida ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => {
                  const subject = subjects.find(s => s.id === result.subject_id);
                  return (
                    <div key={result.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                          style={{ backgroundColor: subject?.color + '20' }}
                        >
                          {subject?.icon || '📚'}
                        </div>
                        <div>
                          <h4 className="font-medium">{subject?.name || 'Matéria'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.correct_answers}/{result.total_questions} acertos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-heading font-bold font-mono">
                          {result.accuracy.toFixed(1)}%
                        </div>
                        <Progress value={result.accuracy} className="w-24 mt-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Section */}
        <Card data-testid="ai-analysis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Análise com IA
            </CardTitle>
            <CardDescription>
              Receba recomendações personalizadas baseadas no seu desempenho
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!aiAnalysis ? (
              <div className="text-center py-6">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <p className="text-muted-foreground mb-4">
                  Clique no botão para gerar uma análise personalizada
                </p>
                <Button 
                  onClick={handleAIAnalysis} 
                  disabled={analyzing || totalQuestions === 0}
                  data-testid="generate-ai-analysis-btn"
                >
                  {analyzing ? 'Analisando...' : 'Gerar Análise com IA'}
                </Button>
                {totalQuestions === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Resolva algumas questões primeiro
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {aiAnalysis.weak_subjects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Áreas que precisam de atenção:</h4>
                    <div className="space-y-2">
                      {aiAnalysis.weak_subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span>{subject.name}</span>
                          <span className="font-mono text-sm">{subject.accuracy.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Recomendações:</h4>
                  <p className="text-muted-foreground leading-relaxed">{aiAnalysis.recommendations}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Plano de Estudos:</h4>
                  <p className="text-muted-foreground leading-relaxed">{aiAnalysis.study_plan}</p>
                </div>

                <Button 
                  variant="outline" 
                  onClick={handleAIAnalysis}
                  disabled={analyzing}
                  className="w-full"
                >
                  {analyzing ? 'Analisando...' : 'Atualizar Análise'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;