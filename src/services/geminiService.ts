import OpenAI from 'openai';
import { Task, User, Project, ExecutiveSummary, TaskEffortEstimation, AISolutionAdvice } from '../types';
import { generateExecutiveSummary, simulateTaskEffortEstimation, simulateAISolutionAdvice } from '../utils/aiSimulator';

// Helper to get active API keys (from runtime storage or environment variables)
export const getGroqApiKey = (): string => {
  return localStorage.getItem('proman_custom_groq_key') || import.meta.env.VITE_GROQ_API_KEY || '';
};

export const getOpenRouterApiKey = (): string => {
  return localStorage.getItem('proman_custom_openrouter_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';
};

export const saveCustomApiKeys = (groqKey?: string, openRouterKey?: string) => {
  if (groqKey !== undefined) {
    if (groqKey.trim()) {
      localStorage.setItem('proman_custom_groq_key', groqKey.trim());
    } else {
      localStorage.removeItem('proman_custom_groq_key');
    }
  }
  if (openRouterKey !== undefined) {
    if (openRouterKey.trim()) {
      localStorage.setItem('proman_custom_openrouter_key', openRouterKey.trim());
    } else {
      localStorage.removeItem('proman_custom_openrouter_key');
    }
  }
};

const GROQ_MODEL = 'openai/gpt-oss-120b';
const OPENROUTER_MODELS = [
  'openrouter/free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free'
];

export const isGeminiConfigured = (): boolean => {
  return Boolean(getGroqApiKey() || getOpenRouterApiKey());
};

// Dynamically create or return active OpenAI client for Groq
function getGroqClient(): OpenAI | null {
  const key = getGroqApiKey();
  if (!key || key.length < 5) return null;
  try {
    return new OpenAI({
      apiKey: key,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    });
  } catch (e) {
    console.warn('[ProMan AI Engine] Failed to initialize Groq client:', e);
    return null;
  }
}

// Dynamically create or return active OpenAI client for OpenRouter
function getOpenRouterClient(): OpenAI | null {
  const key = getOpenRouterApiKey();
  if (!key || key.length < 5) return null;
  try {
    return new OpenAI({
      apiKey: key,
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'HTTP-Referer': 'https://proman-83c57.web.app',
        'X-Title': 'ProMan AI'
      }
    });
  } catch (e) {
    console.warn('[ProMan AI Engine] Failed to initialize OpenRouter client:', e);
    return null;
  }
}

function extractJson(text: string): string {
  const cleaned = text.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenceMatch ? fenceMatch[1].trim() : cleaned;
}

interface LLMOptions {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  temperature?: number;
  responseFormatJson?: boolean;
}

/**
 * Robust API Provider Fallback Chain Runner:
 * 1. Try Primary: Groq (openai/gpt-oss-120b)
 * 2. If failure/429/limit -> Try Secondary: OpenRouter (free models)
 * 3. If failure -> Returns null (caller seamlessly falls back to aiSimulator)
 */
async function executeLLMWithFallback(
  options: LLMOptions,
  featureName: string
): Promise<{ content: string; provider: 'groq' | 'openrouter' } | null> {
  // Step 1: Groq
  const groq = getGroqClient();
  if (groq) {
    try {
      console.log(`[ProMan AI Engine] [1/3] Calling Groq (${GROQ_MODEL}) for ${featureName}...`);
      const response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        ...(options.responseFormatJson ? { response_format: { type: 'json_object' } } : {}),
      });

      const content = response.choices[0]?.message?.content;
      if (content && content.trim().length > 0) {
        console.log(`[ProMan AI Engine] SUCCESS via Groq for ${featureName}`);
        return { content, provider: 'groq' };
      }
    } catch (err: any) {
      console.warn(`[ProMan AI Engine] Groq failed for ${featureName} (${err?.status || err?.message || 'Error'}). Escalating to OpenRouter...`);
    }
  }

  // Step 2: OpenRouter
  const openRouter = getOpenRouterClient();
  if (openRouter) {
    for (const model of OPENROUTER_MODELS) {
      try {
        console.log(`[ProMan AI Engine] [2/3] Calling OpenRouter (${model}) for ${featureName}...`);
        const response = await openRouter.chat.completions.create({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.3,
          ...(options.responseFormatJson ? { response_format: { type: 'json_object' } } : {}),
        });

        const content = response.choices[0]?.message?.content;
        if (content && content.trim().length > 0) {
          console.log(`[ProMan AI Engine] SUCCESS via OpenRouter (${model}) for ${featureName}`);
          return { content, provider: 'openrouter' };
        }
      } catch (err: any) {
        console.warn(`[ProMan AI Engine] OpenRouter model ${model} failed (${err?.status || err?.message || 'Error'}). Trying next model...`);
      }
    }
  }

  console.warn(`[ProMan AI Engine] [3/3] Live providers unavailable for ${featureName}. Falling back to built-in local AI simulator.`);
  return null;
}

/**
 * 0.A AI Smart Task Estimator & Auto-Due Date Predictor
 */
export const estimateLiveTaskEffortAndDueDate = async (
  title: string,
  description: string,
  assigneeId: string,
  startDateStr: string,
  users: User[]
): Promise<TaskEffortEstimation> => {
  const fallback = simulateTaskEffortEstimation(title, description, assigneeId, startDateStr, users);

  const matchedAssignee = users.find(u => u.id === assigneeId);
  const assigneeContext = matchedAssignee
    ? `PIC: ${matchedAssignee.name} (${matchedAssignee.role}, Kapasitas: ${matchedAssignee.capacityHours} jam/mg, Terpakai: ${matchedAssignee.allocatedHours} jam)`
    : 'PIC belum ditentukan';

  const systemPrompt = `Anda adalah seorang Senior Enterprise Tech Lead & Project Estimator AI.
Tugas Anda adalah memperkirakan jam kerja riil, tingkat kompleksitas, dan tanggal deadline yang paling realistis untuk tugas berikut.

Aturan:
- estimatedHours: angka realistis dalam jam (contoh: 4, 8, 16, 24, 32, 40).
- complexityLevel: salah satu dari "Rendah", "Sedang", "Kompleks", "Sangat Kompleks".
- suggestedDueDate: format YYYY-MM-DD, memperhitungkan 6-8 jam/hari kerja, lewati hari Minggu.
- rationale: 1-2 kalimat penjelasan teknis singkat.

Kembalikan HANYA raw JSON tanpa markdown fence.`;

  const userPrompt = `Judul Tugas: "${title}"
Deskripsi: "${description || 'Operasional dan teknis standar'}"
Tanggal Mulai: ${startDateStr || new Date().toISOString().split('T')[0]}
${assigneeContext}

Format output (raw JSON):
{"estimatedHours": 16, "complexityLevel": "Kompleks", "suggestedDueDate": "2026-09-02", "rationale": "..."}`;

  const result = await executeLLMWithFallback(
    {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      responseFormatJson: true,
    },
    'Task Effort Estimator'
  );

  if (result?.content) {
    try {
      const parsed = JSON.parse(extractJson(result.content));
      if (parsed.estimatedHours && parsed.suggestedDueDate) {
        return {
          estimatedHours: Number(parsed.estimatedHours) || 8,
          complexityLevel: parsed.complexityLevel || 'Sedang',
          suggestedDueDate: parsed.suggestedDueDate,
          recommendedAssigneeId: assigneeId,
          rationale: parsed.rationale || 'Dihitung berdasarkan analisis beban kerja dan kompleksitas lingkup tugas.',
        };
      }
    } catch (e) {
      console.warn('[Task Estimator] JSON parse error, falling back to simulator:', e);
    }
  }

  return fallback;
};

/**
 * 0.B AI Smart Troubleshooting & Solution Advisor
 */
export const getLiveAISolutionAdvice = async (
  task: Task,
  userQuestion?: string
): Promise<AISolutionAdvice> => {
  const fallback = simulateAISolutionAdvice(task, userQuestion);

  const subtasksText = (task.subtasks || []).map(s => `- ${s.title} [${s.completed ? 'SELESAI' : 'BELUM'}]`).join('\n');

  const systemPrompt = `Anda adalah seorang Enterprise Senior Solutions Architect & Engineering/Operations Advisor AI.
Berikan panduan pemecahan masalah, langkah implementasi praktis, dan rekomendasi teknis untuk menyelesaikan tugas ini.

Kembalikan HANYA raw JSON tanpa markdown fence dengan format:
{
  "summaryDiagnosis": "...",
  "actionSteps": ["langkah 1", "langkah 2", "langkah 3"],
  "technicalTips": ["tip 1", "tip 2"],
  "potentialPitfalls": ["jebakan 1", "jebakan 2"],
  "suggestedNewSubtasks": ["sub-tugas 1", "sub-tugas 2"]
}`;

  const userPrompt = `Judul Tugas: "${task.title}"
Deskripsi: "${task.description || 'Tidak ada deskripsi'}"
Status: ${task.status} | Prioritas: ${task.priority}
Sub-tugas Saat Ini:
${subtasksText || 'Belum ada sub-tugas'}

Pertanyaan / Hambatan:
"${userQuestion || 'Berikan panduan langkah demi langkah terbaik untuk menyelesaikan tugas ini dengan sukses.'}"`;

  const result = await executeLLMWithFallback(
    {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.25,
      responseFormatJson: true,
    },
    'Solution Advisor'
  );

  if (result?.content) {
    try {
      const parsed = JSON.parse(extractJson(result.content));
      if (parsed.summaryDiagnosis && Array.isArray(parsed.actionSteps)) {
        return {
          id: `advice-${Date.now()}`,
          taskId: task.id,
          summaryDiagnosis: parsed.summaryDiagnosis,
          actionSteps: parsed.actionSteps,
          technicalTips: parsed.technicalTips || [],
          potentialPitfalls: parsed.potentialPitfalls || [],
          suggestedNewSubtasks: parsed.suggestedNewSubtasks || [],
        };
      }
    } catch (e) {
      console.warn('[Solution Advisor] JSON parse error, falling back to simulator:', e);
    }
  }

  return fallback;
};

/**
 * 2. Live Executive Summary & Briefing Generator
 */
export const generateLiveExecutiveSummary = async (
  tasks: Task[],
  users: User[],
  currentProject?: Project
): Promise<ExecutiveSummary> => {
  const fallback = generateExecutiveSummary(tasks, users);

  const projectSummaryText = tasks.map(t => {
    const assigneeNames = (t.assigneeIds || []).map(id => users.find(u => u.id === id)?.name || id).join(', ');
    return `- [${t.status.toUpperCase()}] ${t.title} (PIC: ${assigneeNames}, Priority: ${t.priority}, Due: ${t.dueDate})`;
  }).join('\n');

  const systemInstruction = `Anda adalah Senior Enterprise PMO & Executive Project Reporting Specialist untuk aplikasi ProMan.
Tugas Anda adalah membuat laporan ringkasan status eksekutif resmi yang 100% MENGGUNAKAN BAHASA INDONESIA yang baku, profesional, jelas, dan mendalam.

ATURAN BAHASA & FORMAT WAJIB:
- SELURUH isi konten (headline, keyHighlights, bottlenecksAndRisks, recommendationsForAlex, stakeholderBriefForBudi) WAJIB 100% MENGGUNAKAN BAHASA INDONESIA. DILARANG menggunakan kalimat atau penjelasan dalam bahasa Inggris.
- overallHealth: harus salah satu dari "On Track", "At Risk", atau "Delayed".
- completionRate: angka bulat antara 0 sampai 100.
- headline: satu kalimat judul status proyek yang ringkas, formal, dan padat dalam Bahasa Indonesia.
- keyHighlights: array berisi 3-4 pencapaian operasional terpenting dalam Bahasa Indonesia.
- bottlenecksAndRisks: array berisi 2-3 hambatan atau mitigasi risiko potensial dalam Bahasa Indonesia.
- recommendationsForAlex: array berisi 2-3 rekomendasi taktis manajerial dalam Bahasa Indonesia.
- stakeholderBriefForBudi: narasi eksekutif 3-4 kalimat laporan resmi untuk Direksi/Stakeholder dalam Bahasa Indonesia.

Kembalikan HANYA format raw JSON murni tanpa markdown fence (\`\`\`json).`;

  const userPrompt = `Buatkan ringkasan status eksekutif resmi (100% Bahasa Indonesia) untuk cakupan proyek "${currentProject?.name || 'Semua Project (Global Portfolio)'}".
Daftar seluruh tugas operasional saat ini:
${projectSummaryText}

Wajib kembalikan format raw JSON:
{
  "headline": "Ringkasan status proyek dalam Bahasa Indonesia",
  "overallHealth": "On Track" | "At Risk" | "Delayed",
  "completionRate": 85,
  "keyHighlights": ["Pencapaian 1 dalam Bahasa Indonesia", "Pencapaian 2", "Pencapaian 3"],
  "bottlenecksAndRisks": ["Hambatan 1 dalam Bahasa Indonesia", "Hambatan 2"],
  "recommendationsForAlex": ["Rekomendasi manajerial 1 dalam Bahasa Indonesia", "Rekomendasi 2"],
  "stakeholderBriefForBudi": "Paragraf laporan eksekutif resmi untuk pimpinan dalam Bahasa Indonesia..."
}`;

  const result = await executeLLMWithFallback(
    {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      responseFormatJson: true,
    },
    'Executive Summary'
  );

  if (result?.content) {
    try {
      const parsed = JSON.parse(extractJson(result.content));
      return {
        ...fallback,
        ...parsed,
        id: `exec-${Date.now()}`,
        generatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };
    } catch (e) {
      console.warn('[Executive Summary] JSON parse error, falling back to simulator:', e);
    }
  }

  return fallback;
};
