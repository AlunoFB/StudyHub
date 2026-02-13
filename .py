import numpy as np
import random
import joblib
import os
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# ==============================================================================
# CLASSE DA IA COM MEMÓRIA E INTELIGÊNCIA AMPLIADA
# ==============================================================================
class IASupremaFB:
    def __init__(self, model_path='cerebro_fb.pkl'):
        self.model_path = model_path
        self.last_subject = None  # Memória de curto prazo
        self.last_category = None
        
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            self.train_new_model()

    def gerar_dataset_gigante(self):
        """Gera mais de 3000 contextos para treinamento."""
        print("🛠️ Gerando base de conhecimento de elite (3000+ contextos)...")
        dados = []
        
        # --- MATEMÁTICA & FÍSICA (Cálculos dinâmicos) ---
        for _ in range(800):
            a, b = random.randint(1, 1000), random.randint(1, 1000)
            dados.append((f"Quanto é {a} + {b}?", "exatas"))
            dados.append((f"Calcule a força de uma massa {a} com aceleração {b}", "exatas"))
            dados.append((f"Qual a velocidade média de {a} km em {b} horas?", "exatas"))
            dados.append((f"Fórmula de Bhaskara para delta {a}", "exatas"))
            dados.append((f"Segunda lei de Newton em {a} newtons", "exatas"))

        # --- BIOLOGIA (Foco em Citologia e Genética) ---
        bios = ["mitocôndria", "ribossomo", "complexo de golgi", "DNA", "RNA", "meiose", "mitose"]
        verbos_bio = ["O que faz o", "Explique a", "Função do", "Onde fica o", "Defina"]
        for _ in range(700):
            item = random.choice(bios)
            dados.append((f"{random.choice(verbos_bio)} {item}?", "biologia"))

        # --- HISTÓRIA & GEOGRAFIA ---
        temas_hist = ["Revolução Francesa", "Ditadura Militar", "Era Vargas", "Guerra Fria", "Tratado de Tordesilhas"]
        for _ in range(700):
            tema = random.choice(temas_hist)
            dados.append((f"O que foi a {tema}?", "humanas"))
            dados.append((f"Principais causas da {tema}", "humanas"))
            dados.append((f"Quem participou do {tema}?", "humanas"))

        # --- LITERATURA & PORTUGUÊS ---
        autores = ["Machado de Assis", "Guimarães Rosa", "Clarice Lispector", "José de Alencar"]
        obras = ["Dom Casmurro", "Grande Sertão Veredas", "A Hora da Estrela", "Iracema"]
        for _ in range(600):
            dados.append((f"Quem escreveu {random.choice(obras)}?", "literatura"))
            dados.append((f"Estilo literário de {random.choice(autores)}", "literatura"))
            dados.append((f"O que é uma metáfora?", "literatura"))

        # --- CHIT-CHAT & IDENTIDADE ---
        for _ in range(300):
            dados.append(("Quem é você?", "identidade"))
            dados.append(("Qual o seu nome?", "identidade"))
            dados.append(("Oi", "social"))
            dados.append(("E aí, beleza?", "social"))
            
        random.shuffle(dados)
        return dados

    def train_new_model(self):
        dados = self.gerar_dataset_gigante()
        X = [d[0] for d in dados]
        y = [d[1] for d in dados]
        
        self.model = make_pipeline(CountVectorizer(), MultinomialNB())
        print("🧠 Treinando o cérebro... Aguarde, estou estudando para o ITA.")
        self.model.fit(X, y)
        
        joblib.dump(self.model, self.model_path)
        print(f"✅ Modelo salvo em {self.model_path}")

    def load_model(self):
        print("💾 Carregando conhecimento prévio do disco...")
        self.model = joblib.load(self.model_path)

    def responder(self, input_usuario):
        # 1. Analisar Intenção
        categoria = self.model.predict([input_usuario])[0]
        probabilidades = self.model.predict_proba([input_usuario])
        confianca = np.max(probabilidades)

        # 2. Lógica da Memória de Curto Prazo
        # Se o usuário usar pronomes ou frases curtas, recorremos ao contexto anterior
        pronomes = ["ele", "ela", "disso", "daquilo", "sobre isso", "explica mais"]
        if any(p in input_usuario.lower() for p in pronomes) or confianca < 0.3:
            if self.last_category:
                categoria = self.last_category
                prefixo_memoria = "📚 (Lembrando que ainda estamos falando de " + categoria + "): "
            else:
                prefixo_memoria = ""
        else:
            prefixo_memoria = ""

        self.last_category = categoria # Atualiza a memória

        # 3. Gerador de Respostas Complexas
        respostas = {
            "exatas": [
                "Isso envolve cálculos precisos. Como um bom aluno do FB, você deveria saber que a física explica o universo!",
                "Cálculo detectado. Se for queda livre, não esqueça da gravidade (g ≈ 10m/s² para facilitar a vida).",
                "Matemática é a linguagem de Deus. Delta negativo? Ih, caiu nos complexos."
            ],
            "biologia": [
                "Biologia! Se tem vida, tem DNA. Se tem DNA, tem mitocôndria fazendo o trabalho pesado.",
                "Isso é biológico. Lembre-se que na prova do FB, os detalhes das organelas salvam vidas.",
                "Fisiologia ou genética? De qualquer forma, a resposta está na evolução."
            ],
            "humanas": [
                "Humanas? Interessante. O contexto histórico molda quem somos hoje.",
                "História e Geografia são a base para entender por que o mundo está essa bagunça.",
                "Lembre-se das datas, mas foque nos processos sociais. É o que o ENEM gosta."
            ],
            "literatura": [
                "Ah, a arte das palavras. Machado de Assis teria orgulho (ou não) dessa sua pergunta.",
                "Literatura é a alma da língua. Já leu 'Dom Casmurro' hoje ou vai dizer que Capitu não traiu?",
                "Analisar o eu-lírico é fundamental para não zerar a redação."
            ],
            "identidade": [
                "Eu sou a IA Suprema criada para alunos do Farias Brito. Sou rápida, irônica e inteligente.",
                "Pode me chamar de 'O Oráculo do Ceará'. Meu objetivo é sua aprovação."
            ],
            "social": [
                "E aí! Tudo na paz? Já fez os simulados da semana?",
                "Olá! Menos papo furado e mais estudo, vamos lá!"
            ]
        }

        base_res = random.choice(respostas.get(categoria, ["Não processei isso. Repita, mas com foco!"]))
        return f"{prefixo_memoria}{base_res} (Confiança: {confianca:.2f})"

# ==============================================================================
# EXECUÇÃO DO CHAT
# ==============================================================================
if __name__ == "__main__":
    bot = IASupremaFB()
    
    print("\n" + "="*50)
    print("      SISTEMA IA FARIAS BRITO - VERSÃO 2.0      ")
    print("        (Com Memória de Curto Prazo)            ")
    print("="*50)
    
    while True:
        try:
            prompt = input("\nAluno: ")
            if prompt.lower() in ['sair', 'exit', 'tchau']:
                print("IA: Fui! Boa sorte no simulado de domingo.")
                break
                
            resposta = bot.responder(prompt)
            print(f"IA: {resposta}")
            
        except KeyboardInterrupt:
            break
