import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';

const QuestionSolve = ({ user, onLogout }) => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await api.get(`/questions/${questionId}`);
      setQuestion(response.data);
    } catch (error) {
      toast.error('Erro ao carregar questão');
      navigate('/questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null) {
      toast.error('Selecione uma alternativa');
      return;
    }

    try {
      const response = await api.post('/answers', {
        question_id: questionId,
        selected_option: selectedOption,
        time_spent: timeSpent
      });
      
      setResult(response.data);
      setSubmitted(true);
      
      if (response.data.is_correct) {
        toast.success('Resposta correta! 🎉');
      } else {
        toast.error('Resposta incorreta. Continue praticando!');
      }
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando questão...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Questão não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/questions')}
          data-testid="back-to-questions-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para questões
        </Button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight mb-1">
              Resolvendo Questão
            </h1>
            <p className="text-sm text-muted-foreground">Leia com atenção e escolha a melhor alternativa</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-medium" data-testid="time-spent">{formatTime(timeSpent)}</span>
          </div>
        </div>

        <Card className="mb-6" data-testid="question-card">
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">{question.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedOption?.toString()} onValueChange={(value) => setSelectedOption(parseInt(value))} disabled={submitted}>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect = option.is_correct;
                  const showResult = submitted;
                  
                  let borderColor = 'border-border';
                  if (showResult) {
                    if (isCorrect) {
                      borderColor = 'border-green-500 bg-green-50 dark:bg-green-950';
                    } else if (isSelected && !isCorrect) {
                      borderColor = 'border-red-500 bg-red-50 dark:bg-red-950';
                    }
                  }

                  return (
                    <div key={index} className={`flex items-start space-x-3 border rounded-lg p-4 transition-smooth ${borderColor} ${!submitted && isSelected ? 'ring-2 ring-primary' : ''}`}>
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} data-testid={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer leading-relaxed"
                      >
                        {option.text}
                      </Label>
                      {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </RadioGroup>

            {!submitted && (
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={handleSubmit}
                disabled={selectedOption === null}
                data-testid="submit-answer-btn"
              >
                Confirmar Resposta
              </Button>
            )}
          </CardContent>
        </Card>

        {submitted && (
          <Card data-testid="result-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.is_correct ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                {result.is_correct ? 'Resposta Correta!' : 'Resposta Incorreta'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Explicação:</h4>
                  <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo gasto</p>
                    <p className="font-mono font-medium">{formatTime(timeSpent)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/questions')}
                    data-testid="back-to-list-btn"
                  >
                    Voltar para lista
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                    data-testid="view-dashboard-btn"
                  >
                    Ver Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuestionSolve;