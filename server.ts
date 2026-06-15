import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store with realistic initial data
interface Appointment {
  id: string;
  petName: string;
  petType: "dog" | "cat" | "bird" | "rabbit" | "other";
  petBreed: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  serviceType: "veterinary" | "vaccination" | "grooming" | "bath" | "teeth" | "hotel" | "other";
  dateTime: string; // ISO string or YYYY-MM-DDTHH:mm
  duration: number; // in minutes
  notes: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  reminderStatus: "none" | "drafted" | "sending" | "sent" | "failed";
  reminderEmailSubject?: string;
  reminderEmailBody?: string;
  reminderSentAt?: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  type: "create" | "update" | "delete" | "reminder_draft" | "reminder_sent";
  message: string;
}

let appointments: Appointment[] = [
  {
    id: "apt-1",
    petName: "Pipoca",
    petType: "dog",
    petBreed: "Golden Retriever",
    ownerName: "Mariana Souza",
    ownerEmail: "mariana.souza@gmail.com",
    ownerPhone: "(11) 98765-4321",
    serviceType: "bath",
    dateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 60,
    notes: "Alergia a shampoos perfumados. Usar apenas hipoalergênico.",
    status: "scheduled",
    reminderStatus: "drafted",
    reminderEmailSubject: "Lembrete de Banho do Pipoca na PetFamily! 🐾",
    reminderEmailBody: "Olá Mariana!\n\nPassando para lembrar que o Pipoca tem um horário marcado para Banho na PetFamily amanhã às 10:00.\n\nRecomendamos chegar com 10 minutos de antecedência. O Pipoca vai adorar passar o dia cheiroso com a nossa equipe!\n\nQualquer dúvida, responda este e-mail ou mande um WhatsApp.\n\nAbraços,\nEquipe PetFamily"
  },
  {
    id: "apt-2",
    petName: "Mingau",
    petType: "cat",
    petBreed: "Persa",
    ownerName: "Carlos Oliveira",
    ownerEmail: "carlos.oliver@hotmail.com",
    ownerPhone: "(11) 97123-5678",
    serviceType: "veterinary",
    dateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(14, 30, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 45,
    notes: "Consulta de rotina e aplicação do reforço da vacina V4.",
    status: "scheduled",
    reminderStatus: "drafted",
    reminderEmailSubject: "Consulta Veterinária do Mingau na PetFamily 🐱🩺",
    reminderEmailBody: "Olá Carlos!\n\nEste é um lembrete do agendamento do Mingau na PetFamily para uma consulta de rotina no dia de amanhã às 14:30.\n\nPor favor, traga a carteirinha de vacinação física para que possamos registrá-la.\n\nQualquer imprevisto, avise-nos com antecedência.\n\nAtenciosamente,\nDr. Henrique - Clínica PetFamily"
  },
  {
    id: "apt-3",
    petName: "Floquinho",
    petType: "rabbit",
    petBreed: "Mini Lion",
    ownerName: "Beatriz Mendes",
    ownerEmail: "beatriz.mendes@outlook.com",
    ownerPhone: "(11) 96321-7890",
    serviceType: "vaccination",
    dateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(9, 30, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 30,
    notes: "Vacina anual contra Mixomatose.",
    status: "completed",
    reminderStatus: "sent",
    reminderSentAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    reminderEmailSubject: "Confirmação de Vacinação do Floquinho na PetFamily 🐰💉",
    reminderEmailBody: "Olá Beatriz,\n\nConfirmamos a vacinação e acompanhamento do Floquinho. Seu lembrete foi enviado com sucesso!\n\nEquipe de Imunização PetFamily"
  },
  {
    id: "apt-4",
    petName: "Luna",
    petType: "dog",
    petBreed: "Shih Tzu",
    ownerName: "Juliana Lima",
    ownerEmail: "ju.lima@yahoo.com.br",
    ownerPhone: "(11) 98234-5678",
    serviceType: "grooming",
    dateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(16, 0, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 90,
    notes: "Fazer tosa bebê bem curtinha no corpo e redonda na cabeça.",
    status: "scheduled",
    reminderStatus: "none"
  },
  {
    id: "apt-5",
    petName: "Thor",
    petType: "dog",
    petBreed: "Pastor Alemão",
    ownerName: "Roberto Alencar",
    ownerEmail: "roberto.alencar@uol.com.br",
    ownerPhone: "(11) 99182-7364",
    serviceType: "hotel",
    dateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      d.setHours(8, 0, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 2880, // 2 days
    notes: "Trará ração própria e brinquedos favoritos. Super dócil, mas desconfiado de início.",
    status: "scheduled",
    reminderStatus: "none"
  }
];

let logs: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: "create",
    message: "Agendamento criado para Pipoca (Banho) por Equipe PetFamily."
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "reminder_draft",
    message: "Lembrete automático pré-gerado para o Pipoca."
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: "reminder_sent",
    message: "Lembrete enviado com sucesso para Beatriz Mendes (Floquinho)."
  }
];

// Lazy initialization of Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiClient;
}

// Generate fallback email reminder template locally (highly professional in Portuguese)
function generateLocalEmailTemplate(apt: Appointment): { subject: string; body: string } {
  const dateFormatted = new Date(apt.dateTime).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeFormatted = new Date(apt.dateTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const emojiMap = {
    dog: "🐾🐕",
    cat: "🐾🐱",
    bird: "🦜🐤",
    rabbit: "🐰🐇",
    other: "🐾🐾"
  };
  const emoji = emojiMap[apt.petType] || "🐾";

  const serviceMap = {
    veterinary: "Consulta Veterinária 🩺",
    vaccination: "Aplicação de Vacina 💉",
    grooming: "Tosa Estética ✂️",
    bath: "Banho Relaxante 🧼",
    teeth: "Limpeza de Tártaro🦷",
    hotel: "Hospedagem Familiar 🏨",
    other: "Serviço Especial 🌟"
  };
  const serviceName = serviceMap[apt.serviceType] || "Agendamento";

  const subject = `Lembrete importante: ${apt.petName} tem ${serviceName} na PetFamily! ${emoji}`;
  const body = `Olá, ${apt.ownerName}! 

Este é um lembrete automático da PetFamily passando pela sua tela para confirmar o agendamento do seu amado pet, o(a) ${apt.petName} (${apt.petBreed}).

📅 Detalhes do Compromisso:
• Serviço: ${serviceName}
• Data: ${dateFormatted}
• Horário anunciado: ${timeFormatted}
• Observações do pet: ${apt.notes || "Nenhuma observação especial registrada."}

📍 Estamos te esperando na Rua dos Pets, 123 (PetFamily Matriz). Se precisar remarcar ou tiver alguma dúvida, por favor responda diretamente a este e-mail ou fale conosco pelo telefone/WhatsApp: (11) 4002-8922.

Obrigado por confiar o(a) ${apt.petName} à nossa equipe! Mal podemos esperar para dar todo o carinho e cuidado que ele(a) merece.

Com muito amor,
Equipe PetFamily 🐕🐈‍⬛🐩🐇❤️`;

  return { subject, body };
}

// REST API endpoints

// Get all appointments
app.get("/api/appointments", (req, res) => {
  res.json(appointments);
});

// Create new appointment
app.post("/api/appointments", async (req, res) => {
  try {
    const {
      petName,
      petType,
      petBreed,
      ownerName,
      ownerEmail,
      ownerPhone,
      serviceType,
      dateTime,
      duration,
      notes
    } = req.body;

    if (!petName || !petType || !ownerName || !ownerEmail || !serviceType || !dateTime) {
      return res.status(400).json({ error: "Faltam campos obrigatórios no formulário." });
    }

    const newApt: Appointment = {
      id: "apt-" + Math.random().toString(36).substring(2, 9),
      petName,
      petType,
      petBreed: petBreed || "Indefinida",
      ownerName,
      ownerEmail,
      ownerPhone: ownerPhone || "",
      serviceType,
      dateTime,
      duration: Number(duration) || 30,
      notes: notes || "",
      status: "scheduled",
      reminderStatus: "none"
    };

    // Auto-draft reminder
    const localTemplate = generateLocalEmailTemplate(newApt);
    newApt.reminderStatus = "drafted";
    newApt.reminderEmailSubject = localTemplate.subject;
    newApt.reminderEmailBody = localTemplate.body;

    appointments.unshift(newApt);

    logs.unshift({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      type: "create",
      message: `Novo agendamento criado: ${newApt.petName} (${newApt.petBreed}) de ${newApt.ownerName}.`
    });

    res.status(201).json(newApt);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao criar compromisso: " + err.message });
  }
});

// Update appointment
app.put("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Compromisso não encontrado." });
  }

  const existing = appointments[index];
  const updated = { ...existing, ...req.body };

  // If dateTime, serviceType, petName or notes changed, update the reminder too
  if (
    req.body.dateTime !== existing.dateTime ||
    req.body.serviceType !== existing.serviceType ||
    req.body.petName !== existing.petName ||
    req.body.notes !== existing.notes
  ) {
    const updatedTemplate = generateLocalEmailTemplate(updated);
    updated.reminderEmailSubject = updatedTemplate.subject;
    updated.reminderEmailBody = updatedTemplate.body;
    updated.reminderStatus = "drafted"; // Recria o rascunho
  }

  appointments[index] = updated;

  logs.unshift({
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    type: "update",
    message: `Agendamento editado: ${updated.petName} de ${updated.ownerName}.`
  });

  res.json(updated);
});

// Delete appointment
app.delete("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Compromisso não encontrado." });
  }

  const deleted = appointments[index];
  appointments.splice(index, 1);

  logs.unshift({
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    type: "delete",
    message: `Agendamento removido: ${deleted.petName} (${deleted.ownerName}).`
  });

  res.json({ message: "Compromisso deletado com sucesso." });
});

// Generate Gemini Personalized AI Reminder Email
app.post("/api/appointments/:id/ai-reminder", async (req, res) => {
  const { id } = req.params;
  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) {
    return res.status(404).json({ error: "Compromisso não encontrado." });
  }

  const client = getGeminiClient();

  const mockReasonWhy = !client ? "Usando IA Base Local (Chave de API Gemini não configurada nas Configurações do AI Studio. O template foi otimizado localmente)." : null;

  if (!client) {
    // Generate lovely fallback response
    const template = generateLocalEmailTemplate(appointment);
    appointment.reminderEmailSubject = "🤖 [IA] " + template.subject;
    appointment.reminderEmailBody = template.body + "\n\n---\n✨ Rascunho melhorado localmente (para super personalização com IA real, configure sua GEMINI_API_KEY no painel do AI Studio).";
    appointment.reminderStatus = "drafted";

    logs.unshift({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      type: "reminder_draft",
      message: `Rascunho de lembrete com IA local gerado para ${appointment.petName} de ${appointment.ownerName}.`
    });

    return res.json({
      success: true,
      mock: true,
      message: "Template de IA simulado gerado com sucesso.",
      reason: mockReasonWhy,
      subject: appointment.reminderEmailSubject,
      body: appointment.reminderEmailBody
    });
  }

  try {
    const formattedDate = new Date(appointment.dateTime).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    });

    const aiPrompt = `Você é o redator oficial do centro estético e clínica veterinária "PetFamily".
Crie um e-mail de lembrete de compromisso acolhedor, profissional e criativo direcionado ao dono do animal doméstico.
Seja carinhoso e amigável. Use emojis fofos condizentes com animais e cuidados.

Fatos do compromisso de atendimento:
- Nome do Pet: ${appointment.petName}
- Espécie/Tipo: ${appointment.petType} (como ${appointment.petBreed || "sem raça definida"})
- Nome do Dono(a): ${appointment.ownerName}
- Serviço agendado: ${appointment.serviceType}
- Data e Hora do atendimento: ${formattedDate}
- Observações críticas registradas pela equipe: ${appointment.notes || "Sem observações específicas."}

Você deve retornar um JSON válido contendo exatamente dois campos:
- subject: O título/assunto do email que chame a atenção de forma fofa e alegre em português.
- body: O corpo do email completo com quebras de linhas, carinho com o pet, instruções para trazer carteirinha caso seja consulta ou lembretes de jejum/shampoo caso aplicável, e assinatura calorosa de PetFamily.

Retorne APENAS um objeto JSON limpo que possamos decodificar com JSON.parse. Não envolva em blocos markdown de código além de json normais se necessário ou apenas texto livre JSON.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: aiPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);

    appointment.reminderEmailSubject = parsed.subject || "Lembrete PetFamily da agenda!";
    appointment.reminderEmailBody = parsed.body || "Olá amigo pet!";
    appointment.reminderStatus = "drafted";

    logs.unshift({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      type: "reminder_draft",
      message: `Rascunho inteligente com Gemini AI gerado para ${appointment.petName}.`
    });

    res.json({
      success: true,
      subject: appointment.reminderEmailSubject,
      body: appointment.reminderEmailBody
    });

  } catch (err: any) {
    // Elegant fallback in case of API issues
    const template = generateLocalEmailTemplate(appointment);
    appointment.reminderEmailSubject = template.subject;
    appointment.reminderEmailBody = template.body;
    appointment.reminderStatus = "drafted";

    res.json({
      success: true,
      errorOccurred: true,
      message: "Rascunho gerado via template padrão (Ocorreu uma falha na chamada com a API Gemini).",
      subject: template.subject,
      body: template.body
    });
  }
});

// Trigger email reminder sending simulated
app.post("/api/appointments/:id/send-reminder", (req, res) => {
  const { id } = req.params;
  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) {
    return res.status(404).json({ error: "Compromisso não encontrado." });
  }

  // Ensure there is a template
  if (!appointment.reminderEmailSubject || !appointment.reminderEmailBody) {
    const template = generateLocalEmailTemplate(appointment);
    appointment.reminderEmailSubject = template.subject;
    appointment.reminderEmailBody = template.body;
  }

  appointment.reminderStatus = "sent";
  appointment.reminderSentAt = new Date().toISOString();

  logs.unshift({
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    type: "reminder_sent",
    message: `E-mail de lembrete enviado com sucesso para ${appointment.ownerEmail} (${appointment.petName} - ${appointment.ownerName}).`
  });

  res.json({
    success: true,
    sentTo: appointment.ownerEmail,
    sentAt: appointment.reminderSentAt,
    subject: appointment.reminderEmailSubject,
    body: appointment.reminderEmailBody
  });
});

// Get Live Logs of activity
app.get("/api/logs", (req, res) => {
  res.json(logs);
});

// Clear all logs
app.post("/api/logs/clear", (req, res) => {
  logs = [];
  res.json({ message: "Logs limpos" });
});

// Get general business stats (automatic stats calculation for the staff)
app.get("/api/dashboard-stats", (req, res) => {
  const total = appointments.length;
  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;
  const remindersSent = appointments.filter((a) => a.reminderStatus === "sent").length;
  const nextReminders = appointments.filter((a) => a.status === "scheduled" && a.reminderStatus === "drafted").length;

  res.json({
    total,
    scheduled,
    completed,
    cancelled,
    remindersSent,
    nextReminders
  });
});

// Start server
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PetFamily server started and listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
