import numpy as np
import random
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# ==============================================================================
# 1. O GERADOR DE DADOS SINTÉTICOS (A Mágica dos 3k)
# ==============================================================================
def gerar_dataset_monstruoso(quantidade=3000):
    dados = []
    
    # --- Templates para MATEMÁTICA (Gera milhares de combinações únicas) ---
    print(f"⚙️ Gerando {quantidade} contextos de treinamento...")
    
    for _ in range(quantidade // 4): # 25% do dataset
        a = random.randint(1, 100)
        b = random.randint(1, 100)
        operacoes = [
            (f"Quanto é {a} + {b}?", "matematica"),
            (f"Calcule {a} vezes {b}", "matematica"),
            (f"Qual a raiz quadrada de {a}?", "matematica"),
            (f"Resolva: {a} / {b}", "matematica"),
            (f"A soma de {a} com {b}", "matematica"),
            (f"Me ajude com essa conta: {a} - {b}", "matematica")
        ]
        dados.append(random.choice(operacoes))

    # --- Templates para HISTÓRIA DO BRASIL ---
    sujeitos_hist = ["Dom Pedro", "Cabral", "Tiradentes", "Getúlio Vargas", "Deodoro"]
    acoes_hist = ["descobriu", "proclamou", "morreu", "governou", "nasceu"]
    complementos_hist = ["o Brasil", "a República", "na independência", "no golpe", "em 1500"]
    
    for _ in range(quantidade // 4):
        frase = f"Quem {random.choice(acoes_hist)} {random.choice(complementos_hist)}?"
        dados.append((frase, "historia"))
        dados.append((f"Fale sobre {random.choice(sujeitos_hist)}", "historia"))

    # --- Templates para BIOLOGIA/CIÊNCIAS ---
    conceitos = ["mitocôndria", "DNA", "célula", "fotossíntese", "osmose", "proteína", "vírus"]
    perguntas_bio = ["O que é", "Defina", "Qual a função da", "Explique o conceito de", "Resumo sobre"]
    
    for _ in range(quantidade // 4):
        conceito = random.choice(conceitos)
        pergunta = random.choice(perguntas_bio)
        dados.append((f"{pergunta} {conceito}?", "biologia"))

    # --- Templates para SOCIAL/CHIT-CHAT ---
    saudacoes = ["Oi", "Olá", "E aí", "Bom dia", "Boa tarde", "Fala tu"]
    perguntas_pessoais = ["quem é você", "qual seu nome", "voce é uma ia", "quem te criou"]
    
    for _ in range(quantidade // 4):
        if random.random() > 0.5:
            dados.append((random.choice(saudacoes), "cumprimento"))
        else:
            dados.append((random.choice(perguntas_pessoais), "identidade"))

    random.shuffle(dados)
    return dados

# ==============================================================================
# 2. TREINAMENTO (MACHINE LEARNING)
# ==============================================================================

# Gerando os 3.000 (ou mais) dados agora
dados_treino = gerar_dataset_monstruoso(3000)

print(f"📊 Dataset gerado com sucesso! Total de exemplos: {len(dados_treino)}")
print(f"Exemplo de dado gerado: {dados_treino[0]}")

# Separando X (texto) e y (categoria)
X_treino = [item[0] for item in dados_treino]
y_treino = [item[1] for item in dados_treino]

# Criando e treinando o modelo
modelo = make_pipeline(CountVectorizer(), MultinomialNB())
print("🧠 Treinando a IA... (Isso pode levar uns segundos)")
modelo.fit(X_treino, y_treino)
print("✅ IA Treinada e pronta para o combate!")

# ==============================================================================
# 3. O CÉREBRO DAS RESPOSTAS (Lógica de Resposta Complexa)
# ==============================================================================
def responder(texto_usuario):
    # Previsão da categoria
    categoria = modelo.predict([texto_usuario])[0]
    probabilidade = np.max(modelo.predict_proba([texto_usuario]))
    
    # Respostas baseadas na categoria detectada
    if probabilidade < 0.45: # Se a IA estiver confusa
        return "Cara, não entendi nada. Fala português, por favor. Sou do FB, não adivinha."
    
    if categoria == "matematica":
        return f"Isso é matemática. Use a lógica ou uma calculadora. Eu sei que é sobre números! (Certeza: {probabilidade:.2f})"
    
    elif categoria == "historia":
        return f"História é fascinante. O Brasil tem mais reviravoltas que novela das nove. Quer saber datas ou nomes? (Certeza: {probabilidade:.2f})"
    
    elif categoria == "biologia":
        return f"Biologia detectada. Lembre-se: Mitocôndria = respiração celular. O resto a gente chuta no ENEM. (Certeza: {probabilidade:.2f})"
    
    elif categoria == "cumprimento":
        return "E aí, aluno! Bora estudar ou tá só enrolando?"
    
    elif categoria == "identidade":
        return "Sou a IA Suprema do Farias Brito. Fui criada para garantir sua aprovação e corrigir seu português."
    
    return "Buguei."

# ==============================================================================
# 4. CHAT INTERATIVO
# ==============================================================================
if __name__ == "__main__":
    print("\n" + "="*40)
    print("      IA FARIAS BRITO - ONLINE      ")
    print("="*40)
    print("(Digite 'sair' para fechar)")
    
    while True:
        try:
            user_input = input("\nVocê: ")
            if user_input.lower() in ['sair', 'exit', 'tchau']:
                print("IA: Falou! Vai estudar.")
                break
            
            resposta = responder(user_input)
            print(f"IA: {resposta}")
            
        except KeyboardInterrupt:
            print("\nIA: Encerrando forçadamente...")
            break
