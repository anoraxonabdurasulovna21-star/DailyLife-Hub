import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Smart Insights API
app.post('/api/ai-insights', async (req, res) => {
  try {
    const { userName, statsSummary, dateRange } = req.body;

    // Deterministic fallback generator if API key is not present or if quota/network fails
    const generateLocalInsights = () => {
      const insights: string[] = [];
      const { tasks, habits, finance, study, goals } = statsSummary || {};

      if (tasks) {
        if (tasks.total > 0) {
          insights.push(
            `Siz jami ${tasks.total} ta vazifadan ${tasks.completed} tasini (${tasks.completionRate}%) bajardingiz.`
          );
          if (tasks.earlyRate > 0) {
            insights.push(
              `Vazifalarning ${tasks.earlyRate}% qismi muddatidan oldin yakunlangan — bu ajoyib vaqt boshqaruvi natijasi!`
            );
          }
          if (tasks.overdue > 0) {
            insights.push(
              `Hozirda ${tasks.overdue} ta muddati o‘tgan vazifa mavjud. Ularni rejalashtirishga e'tibor qarating.`
            );
          }
        } else {
          insights.push(
            `Hali vazifalar kiritilmagan. Birinchi vazifangizni rejalashtirib, unumdorlikni oshiring.`
          );
        }
      }

      if (study) {
        if (study.totalMinutes > 0) {
          const hours = Math.floor(study.totalMinutes / 60);
          const mins = study.totalMinutes % 60;
          const timeStr = hours > 0 ? `${hours} soat ${mins} daqiqa` : `${mins} daqiqa`;
          insights.push(
            `O‘qish va Pomodoro seanslariga jami ${timeStr} vaqt ajratildi (${study.sessionsCount || 0} ta seans).`
          );
        } else {
          insights.push(
            `Bugun yoki tanlangan davrda o‘qish taymeri ishlatilmagan. 25 daqiqalik Pomodoro bilan diqqatni jamlang.`
          );
        }
      }

      if (habits) {
        if (habits.totalHabits > 0) {
          insights.push(
            `Odatlar bo‘yicha umumiy intizom darajasi: ${habits.averageConsistency || 0}%.`
          );
          if (habits.bestHabit) {
            insights.push(
              `Eng barqaror bajarilayotgan odat: "${habits.bestHabit.title}" (Streak: ${habits.bestHabit.streak} kun).`
            );
          }
        }
      }

      if (finance) {
        const net = (finance.totalIncome || 0) - (finance.totalExpenses || 0);
        insights.push(
          `Moliyaviy ko‘rsatkich: Daromad ${finance.totalIncome?.toLocaleString() || 0} so‘m, Xarajat ${finance.totalExpenses?.toLocaleString() || 0} so‘m, Qoldiq ${net.toLocaleString()} so‘m.`
        );
        if (finance.topCategory) {
          insights.push(
            `Eng ko‘p xarajat yo‘nalishi: ${finance.topCategory.name} (${finance.topCategory.amount?.toLocaleString()} so‘m).`
          );
        }
      }

      if (goals) {
        if (goals.total > 0) {
          insights.push(
            `Maqsadlar: ${goals.total} ta maqsaddan ${goals.completed} tasi muvaffaqiyatli yakunlandi.`
          );
        }
      }

      return {
        insights,
        summary: `${userName || 'Foydalanuvchi'}, sizning faoliyat ma'lumotlaringiz asosida kunlik va haftalik dinamika hisoblandi. Barqarorlikni saqlab qolish muvaffaqiyat garovidir.`,
        recommendation: tasks?.overdue > 0 
          ? "Birinchi navbatda muddati o'tgan topshiriqlarni bartaraf eting va bugungi asosiy maqsadga diqqat qarating."
          : "Rejalashtirilgan tartib bo'yicha davom eting va odatlaringiz zanjirini uzmang.",
      };
    };

    if (!aiClient) {
      return res.json(generateLocalInsights());
    }

    const prompt = `
Siz DailyLife Hub tizimining sun'iy intellekt tahlilchisisiz.
Foydalanuvchi ismi: ${userName || 'Foydalanuvchi'}
Ko'rilayotgan davr: ${dateRange || 'Hozirgi vaqt'}

Foydalanuvchining real tizim statistikasi:
${JSON.stringify(statsSummary, null, 2)}

QOIDALAR:
1. Barcha javob to'liq tabiiy O'zbek lotin alifbosida bo'lishi shart.
2. Faqat taqdim etilgan real ma'lumotlarga asoslaning. Hech qanday soxta ma'lumot to'qimang.
3. Tibbiy tashxis yoki psixologik taxminlar qilmang.
4. Javobni JSON formatida qaytaring:
{
  "insights": ["Faktik tahlil 1", "Faktik tahlil 2", "Faktik tahlil 3"],
  "summary": "Umumiy qisqa xulosa (1-2 gap)",
  "recommendation": "Amaliy va real tavsiya (1 gap)"
}
`;

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (modelError) {
      console.warn('Gemini API call failed, falling back to local factual engine:', modelError);
      return res.json(generateLocalInsights());
    }
  } catch (error) {
    console.error('AI Insights endpoint error:', error);
    res.status(500).json({ error: 'Tahlil jarayonida xatolik yuz berdi' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DailyLife Hub server running on http://localhost:${PORT}`);
  });
}

startServer();
