import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent / 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / 'backend' / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_data():
    print("Limpando dados existentes...")
    await db.subjects.delete_many({})
    await db.questions.delete_many({})
    
    print("Inserindo matérias...")
    subjects = [
        {
            "id": "math",
            "name": "Matemática",
            "icon": "📐",
            "color": "#3B82F6",
            "total_questions": 0
        },
        {
            "id": "physics",
            "name": "Física",
            "icon": "⚛️",
            "color": "#8B5CF6",
            "total_questions": 0
        },
        {
            "id": "chemistry",
            "name": "Química",
            "icon": "🧪",
            "color": "#10B981",
            "total_questions": 0
        },
        {
            "id": "biology",
            "name": "Biologia",
            "icon": "🧬",
            "color": "#F59E0B",
            "total_questions": 0
        },
        {
            "id": "portuguese",
            "name": "Português",
            "icon": "📚",
            "color": "#EF4444",
            "total_questions": 0
        },
        {
            "id": "history",
            "name": "História",
            "icon": "🏛️",
            "color": "#6366F1",
            "total_questions": 0
        }
    ]
    
    await db.subjects.insert_many(subjects)
    
    print("Inserindo questões de exemplo...")
    questions = [
        {
            "id": "q1",
            "subject_id": "math",
            "difficulty": "easy",
            "question_text": "Qual é o resultado de 2 + 2?",
            "options": [
                {"text": "3", "is_correct": False},
                {"text": "4", "is_correct": True},
                {"text": "5", "is_correct": False},
                {"text": "6", "is_correct": False}
            ],
            "explanation": "A soma de 2 + 2 é igual a 4. Esta é uma operação básica de adição.",
            "created_by": "system",
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "q2",
            "subject_id": "math",
            "difficulty": "medium",
            "question_text": "Resolva a equação: 2x + 5 = 15. Qual é o valor de x?",
            "options": [
                {"text": "5", "is_correct": True},
                {"text": "10", "is_correct": False},
                {"text": "7.5", "is_correct": False},
                {"text": "2.5", "is_correct": False}
            ],
            "explanation": "2x + 5 = 15 → 2x = 10 → x = 5. Para resolver, isolamos x subtraindo 5 de ambos os lados e depois dividindo por 2.",
            "created_by": "system",
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "q3",
            "subject_id": "physics",
            "difficulty": "medium",
            "question_text": "Qual é a unidade de medida da força no Sistema Internacional?",
            "options": [
                {"text": "Joule (J)", "is_correct": False},
                {"text": "Newton (N)", "is_correct": True},
                {"text": "Watt (W)", "is_correct": False},
                {"text": "Pascal (Pa)", "is_correct": False}
            ],
            "explanation": "A unidade de força no SI é o Newton (N), em homenagem a Isaac Newton. 1 N = 1 kg⋅m/s².",
            "created_by": "system",
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "q4",
            "subject_id": "chemistry",
            "difficulty": "easy",
            "question_text": "Qual é o símbolo químico da água?",
            "options": [
                {"text": "H2O", "is_correct": True},
                {"text": "CO2", "is_correct": False},
                {"text": "O2", "is_correct": False},
                {"text": "NaCl", "is_correct": False}
            ],
            "explanation": "A água é formada por dois átomos de hidrogênio (H) e um átomo de oxigênio (O), portanto H2O.",
            "created_by": "system",
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "q5",
            "subject_id": "biology",
            "difficulty": "medium",
            "question_text": "Qual organela celular é responsável pela respiração celular?",
            "options": [
                {"text": "Núcleo", "is_correct": False},
                {"text": "Ribossomo", "is_correct": False},
                {"text": "Mitocôndria", "is_correct": True},
                {"text": "Cloroplasto", "is_correct": False}
            ],
            "explanation": "A mitocôndria é a organela responsável pela respiração celular, produzindo ATP (energia) para a célula.",
            "created_by": "system",
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "q6",
            "subject_id": "portuguese",
            "difficulty": "easy",
            "question_text": "Qual é a classe gramatical da palavra 'rapidamente'?",
            "options": [
                {"text": "Adjetivo", "is_correct": False},
                {"text": "Advérbio", "is_correct": True},
                {"text": "Substantivo", "is_correct": False},
                {"text": "Verbo", "is_correct": False}
            ],
            "explanation": "A palavra 'rapidamente' é um advérbio de modo, que modifica o verbo indicando como a ação é realizada.",
            "created_by": "system",
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "q7",
            "subject_id": "history",
            "difficulty": "medium",
            "question_text": "Em que ano foi proclamada a independência do Brasil?",
            "options": [
                {"text": "1500", "is_correct": False},
                {"text": "1822", "is_correct": True},
                {"text": "1889", "is_correct": False},
                {"text": "1808", "is_correct": False}
            ],
            "explanation": "A independência do Brasil foi proclamada em 7 de setembro de 1822 por D. Pedro I às margens do rio Ipiranga.",
            "created_by": "system",
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "q8",
            "subject_id": "math",
            "difficulty": "hard",
            "question_text": "Qual é o valor de sen(45°)?",
            "options": [
                {"text": "1", "is_correct": False},
                {"text": "√2/2", "is_correct": True},
                {"text": "√3/2", "is_correct": False},
                {"text": "1/2", "is_correct": False}
            ],
            "explanation": "O seno de 45° é √2/2 (aproximadamente 0,707). Este é um valor trigonométrico fundamental.",
            "created_by": "system",
            "created_at": "2025-01-01T00:00:00Z"
        }
    ]
    
    await db.questions.insert_many(questions)
    
    # Update subject total_questions
    for subject in subjects:
        count = await db.questions.count_documents({"subject_id": subject["id"]})
        await db.subjects.update_one({"id": subject["id"]}, {"$set": {"total_questions": count}})
    
    print("✅ Dados iniciais inseridos com sucesso!")
    print(f"- {len(subjects)} matérias criadas")
    print(f"- {len(questions)} questões criadas")

if __name__ == "__main__":
    asyncio.run(seed_data())
