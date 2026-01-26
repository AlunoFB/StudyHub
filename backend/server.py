from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthority
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

JWT_SECRET_KEY = os.environ['JWT_SECRET_KEY']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ['ACCESS_TOKEN_EXPIRE_MINUTES'])

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ========== MODELS ==========

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str
    avatar: Optional[str] = None
    weekly_goal: int = 50
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Subject(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    color: str
    total_questions: int = 0

class SubjectCreate(BaseModel):
    name: str
    icon: str
    color: str

class QuestionOption(BaseModel):
    text: str
    is_correct: bool

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subject_id: str
    difficulty: str
    question_text: str
    options: List[QuestionOption]
    explanation: str
    created_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class QuestionCreate(BaseModel):
    subject_id: str
    difficulty: str
    question_text: str
    options: List[QuestionOption]
    explanation: str

class Answer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    question_id: str
    selected_option: int
    is_correct: bool
    answered_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    time_spent: int

class AnswerSubmit(BaseModel):
    question_id: str
    selected_option: int
    time_spent: int

class Result(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    subject_id: str
    total_questions: int
    correct_answers: int
    accuracy: float
    last_updated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RankingUser(BaseModel):
    name: str
    total_questions: int
    correct_answers: int
    accuracy: float

class AIAnalysisRequest(BaseModel):
    user_id: str

class AIAnalysisResponse(BaseModel):
    weak_subjects: List[dict]
    recommendations: str
    study_plan: str

# ========== AUTH HELPERS ==========

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(authorization: str = Depends(security)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = authorization.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return user

# ========== ROUTES ==========

@api_router.get("/")
async def root():
    return {"message": "StudyHub FB API"}

# AUTH ROUTES
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        "id": str(uuid.uuid4()),
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "role": user_data.role,
        "avatar": None,
        "weekly_goal": 50,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user_dict["id"]})
    user_response = UserResponse(
        id=user_dict["id"],
        name=user_dict["name"],
        email=user_dict["email"],
        role=user_dict["role"],
        avatar=user_dict["avatar"],
        weekly_goal=user_dict["weekly_goal"],
        created_at=user_dict["created_at"]
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    user_response = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        avatar=user.get("avatar"),
        weekly_goal=user.get("weekly_goal", 50),
        created_at=user["created_at"]
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# SUBJECT ROUTES
@api_router.post("/subjects", response_model=Subject)
async def create_subject(subject_data: SubjectCreate, current_user: dict = Depends(get_current_user)):
    subject_dict = subject_data.model_dump()
    subject_obj = Subject(**subject_dict)
    doc = subject_obj.model_dump()
    await db.subjects.insert_one(doc)
    return subject_obj

@api_router.get("/subjects", response_model=List[Subject])
async def get_subjects():
    subjects = await db.subjects.find({}, {"_id": 0}).to_list(100)
    return subjects

# QUESTION ROUTES
@api_router.post("/questions", response_model=Question)
async def create_question(question_data: QuestionCreate, current_user: dict = Depends(get_current_user)):
    question_dict = question_data.model_dump()
    question_dict["created_by"] = current_user["id"]
    question_obj = Question(**question_dict)
    doc = question_obj.model_dump()
    await db.questions.insert_one(doc)
    
    # Update subject total questions
    await db.subjects.update_one(
        {"id": question_data.subject_id},
        {"$inc": {"total_questions": 1}}
    )
    
    return question_obj

@api_router.get("/questions", response_model=List[Question])
async def get_questions(subject_id: Optional[str] = None, difficulty: Optional[str] = None):
    query = {}
    if subject_id:
        query["subject_id"] = subject_id
    if difficulty:
        query["difficulty"] = difficulty
    
    questions = await db.questions.find(query, {"_id": 0}).to_list(1000)
    return questions

@api_router.get("/questions/{question_id}", response_model=Question)
async def get_question(question_id: str):
    question = await db.questions.find_one({"id": question_id}, {"_id": 0})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

# ANSWER ROUTES
@api_router.post("/answers", response_model=Answer)
async def submit_answer(answer_data: AnswerSubmit, current_user: dict = Depends(get_current_user)):
    question = await db.questions.find_one({"id": answer_data.question_id}, {"_id": 0})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_correct = question["options"][answer_data.selected_option]["is_correct"]
    
    answer_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "question_id": answer_data.question_id,
        "selected_option": answer_data.selected_option,
        "is_correct": is_correct,
        "answered_at": datetime.now(timezone.utc).isoformat(),
        "time_spent": answer_data.time_spent
    }
    
    await db.answers.insert_one(answer_dict)
    
    # Update or create result
    result = await db.results.find_one(
        {"user_id": current_user["id"], "subject_id": question["subject_id"]},
        {"_id": 0}
    )
    
    if result:
        new_total = result["total_questions"] + 1
        new_correct = result["correct_answers"] + (1 if is_correct else 0)
        new_accuracy = (new_correct / new_total) * 100
        
        await db.results.update_one(
            {"id": result["id"]},
            {"$set": {
                "total_questions": new_total,
                "correct_answers": new_correct,
                "accuracy": new_accuracy,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        result_dict = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "subject_id": question["subject_id"],
            "total_questions": 1,
            "correct_answers": 1 if is_correct else 0,
            "accuracy": 100.0 if is_correct else 0.0,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        await db.results.insert_one(result_dict)
    
    return Answer(**answer_dict)

@api_router.get("/answers/my-answers", response_model=List[Answer])
async def get_my_answers(current_user: dict = Depends(get_current_user)):
    answers = await db.answers.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return answers

# RESULTS ROUTES
@api_router.get("/results", response_model=List[Result])
async def get_results(current_user: dict = Depends(get_current_user)):
    results = await db.results.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return results

# RANKING ROUTE
@api_router.get("/ranking", response_model=List[RankingUser])
async def get_ranking():
    pipeline = [
        {
            "$group": {
                "_id": "$user_id",
                "total_questions": {"$sum": "$total_questions"},
                "correct_answers": {"$sum": "$correct_answers"}
            }
        },
        {
            "$project": {
                "user_id": "$_id",
                "total_questions": 1,
                "correct_answers": 1,
                "accuracy": {
                    "$multiply": [
                        {"$divide": ["$correct_answers", "$total_questions"]},
                        100
                    ]
                }
            }
        },
        {"$sort": {"correct_answers": -1}},
        {"$limit": 10}
    ]
    
    ranking_data = await db.results.aggregate(pipeline).to_list(10)
    
    ranking_users = []
    for item in ranking_data:
        user = await db.users.find_one({"id": item["user_id"]}, {"_id": 0, "name": 1})
        if user:
            ranking_users.append(RankingUser(
                name=user["name"],
                total_questions=item["total_questions"],
                correct_answers=item["correct_answers"],
                accuracy=round(item["accuracy"], 2)
            ))
    
    return ranking_users

# AI ANALYSIS ROUTE
@api_router.post("/ai/analyze", response_model=AIAnalysisResponse)
async def ai_analysis(request: AIAnalysisRequest, current_user: dict = Depends(get_current_user)):
    if request.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Get user results
    results = await db.results.find({"user_id": request.user_id}, {"_id": 0}).to_list(100)
    
    if not results:
        return AIAnalysisResponse(
            weak_subjects=[],
            recommendations="Comece a resolver questões para receber análises personalizadas!",
            study_plan="Explore as matérias disponíveis e teste seus conhecimentos."
        )
    
    # Get subjects data
    weak_subjects = []
    for result in results:
        if result["accuracy"] < 70:
            subject = await db.subjects.find_one({"id": result["subject_id"]}, {"_id": 0})
            if subject:
                weak_subjects.append({
                    "name": subject["name"],
                    "accuracy": result["accuracy"],
                    "total_questions": result["total_questions"]
                })
    
    # Prepare AI prompt
    analysis_data = f"""Análise de desempenho do aluno:
    
Matérias com baixo desempenho (abaixo de 70%):
{chr(10).join([f"- {s['name']}: {s['accuracy']:.1f}% de acerto em {s['total_questions']} questões" for s in weak_subjects])}
    
Total de matérias estudadas: {len(results)}
    """
    
    # Call AI
    try:
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=f"analysis_{request.user_id}",
            system_message="Você é um assistente educacional especializado em vestibulares brasileiros. Analise o desempenho do aluno e forneça recomendações práticas e motivadoras."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(
            text=f"{analysis_data}\n\nCom base nesses dados, forneça:\n1. Recomendações específicas de estudo (2-3 frases)\n2. Um plano de estudos semanal focado (3-4 frases)"
        )
        
        response = await chat.send_message(user_message)
        
        return AIAnalysisResponse(
            weak_subjects=weak_subjects,
            recommendations=response[:300] if len(response) > 300 else response,
            study_plan=response[300:] if len(response) > 300 else "Continue praticando regularmente!"
        )
    except Exception as e:
        logging.error(f"AI analysis error: {e}")
        return AIAnalysisResponse(
            weak_subjects=weak_subjects,
            recommendations="Foque nas matérias com menor desempenho e pratique questões diariamente.",
            study_plan="Dedique 30 minutos por dia para cada matéria que precisa melhorar."
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()