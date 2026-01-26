import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';

const Ranking = ({ user, onLogout }) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await api.get('/ranking');
      setRanking(response.data);
    } catch (error) {
      toast.error('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 0:
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200';
      case 1:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200';
      case 2:
        return 'bg-amber-50 dark:bg-amber-950 border-amber-200';
      default:
        return 'bg-card';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando ranking...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-2">
            Ranking de Estudantes
          </h1>
          <p className="text-muted-foreground">Veja como você se compara com outros estudantes</p>
        </div>

        <Card data-testid="ranking-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Top 10 Estudantes
            </CardTitle>
            <CardDescription>
              Ranking baseado no número de questões corretas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhum estudante no ranking ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ranking.map((student, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-smooth ${getPositionColor(index)}`}
                    data-testid={`ranking-position-${index + 1}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-heading font-bold">
                        {index < 3 ? getMedalIcon(index) : `${index + 1}º`}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.correct_answers} acertos em {student.total_questions} questões
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-heading font-bold font-mono">
                        {student.accuracy.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">precisão</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Ranking;