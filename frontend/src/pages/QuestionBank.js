import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';

const QuestionBank = ({ user, onLogout }) => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [selectedSubject, selectedDifficulty]);

  const fetchData = async () => {
    try {
      const [questionsRes, subjectsRes] = await Promise.all([
        api.get('/questions'),
        api.get('/subjects')
      ]);
      
      setQuestions(questionsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar questões');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = async () => {
    try {
      const params = {};
      if (selectedSubject !== 'all') params.subject_id = selectedSubject;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      
      const response = await api.get('/questions', { params });
      setQuestions(response.data);
    } catch (error) {
      toast.error('Erro ao filtrar questões');
    }
  };

  const getSubjectById = (id) => subjects.find(s => s.id === id);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'hard': return 'text-red-600 bg-red-50 dark:bg-red-950';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando questões...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-2">
            Banco de Questões
          </h1>
          <p className="text-muted-foreground">Pratique e aprimore seus conhecimentos</p>
        </div>

        {/* Filters */}
        <Card className="mb-8" data-testid="filters-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Matéria</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger data-testid="subject-filter-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as matérias</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.icon} {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Dificuldade</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger data-testid="difficulty-filter-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as dificuldades</SelectItem>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma questão encontrada</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros ou aguarde novas questões</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="questions-list">
            {questions.map((question, index) => {
              const subject = getSubjectById(question.subject_id);
              return (
                <Card key={question.id} className="hover:shadow-lg transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {subject && (
                            <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: subject.color + '20', color: subject.color }}>
                              {subject.icon} {subject.name}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {getDifficultyLabel(question.difficulty)}
                          </span>
                        </div>
                        <CardTitle className="text-lg">Questão {index + 1}</CardTitle>
                        <CardDescription className="mt-2 leading-relaxed">
                          {question.question_text}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/questions/${question.id}`}>
                      <Button className="w-full" data-testid={`solve-question-${index}-btn`}>
                        Resolver Questão
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionBank;