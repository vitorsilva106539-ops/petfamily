var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var appointments = [
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
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 60,
    notes: "Alergia a shampoos perfumados. Usar apenas hipoalerg\xEAnico.",
    status: "scheduled",
    reminderStatus: "drafted",
    reminderEmailSubject: "Lembrete de Banho do Pipoca na PetFamily! \u{1F43E}",
    reminderEmailBody: "Ol\xE1 Mariana!\n\nPassando para lembrar que o Pipoca tem um hor\xE1rio marcado para Banho na PetFamily amanh\xE3 \xE0s 10:00.\n\nRecomendamos chegar com 10 minutos de anteced\xEAncia. O Pipoca vai adorar passar o dia cheiroso com a nossa equipe!\n\nQualquer d\xFAvida, responda este e-mail ou mande um WhatsApp.\n\nAbra\xE7os,\nEquipe PetFamily"
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
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(14, 30, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 45,
    notes: "Consulta de rotina e aplica\xE7\xE3o do refor\xE7o da vacina V4.",
    status: "scheduled",
    reminderStatus: "drafted",
    reminderEmailSubject: "Consulta Veterin\xE1ria do Mingau na PetFamily \u{1F431}\u{1FA7A}",
    reminderEmailBody: "Ol\xE1 Carlos!\n\nEste \xE9 um lembrete do agendamento do Mingau na PetFamily para uma consulta de rotina no dia de amanh\xE3 \xE0s 14:30.\n\nPor favor, traga a carteirinha de vacina\xE7\xE3o f\xEDsica para que possamos registr\xE1-la.\n\nQualquer imprevisto, avise-nos com anteced\xEAncia.\n\nAtenciosamente,\nDr. Henrique - Cl\xEDnica PetFamily"
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
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(9, 30, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 30,
    notes: "Vacina anual contra Mixomatose.",
    status: "completed",
    reminderStatus: "sent",
    reminderSentAt: new Date(Date.now() - 24 * 36e5).toISOString(),
    reminderEmailSubject: "Confirma\xE7\xE3o de Vacina\xE7\xE3o do Floquinho na PetFamily \u{1F430}\u{1F489}",
    reminderEmailBody: "Ol\xE1 Beatriz,\n\nConfirmamos a vacina\xE7\xE3o e acompanhamento do Floquinho. Seu lembrete foi enviado com sucesso!\n\nEquipe de Imuniza\xE7\xE3o PetFamily"
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
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(16, 0, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 90,
    notes: "Fazer tosa beb\xEA bem curtinha no corpo e redonda na cabe\xE7a.",
    status: "scheduled",
    reminderStatus: "none"
  },
  {
    id: "apt-5",
    petName: "Thor",
    petType: "dog",
    petBreed: "Pastor Alem\xE3o",
    ownerName: "Roberto Alencar",
    ownerEmail: "roberto.alencar@uol.com.br",
    ownerPhone: "(11) 99182-7364",
    serviceType: "hotel",
    dateTime: (() => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + 5);
      d.setHours(8, 0, 0, 0);
      return d.toISOString().substring(0, 16);
    })(),
    duration: 2880,
    // 2 days
    notes: "Trar\xE1 ra\xE7\xE3o pr\xF3pria e brinquedos favoritos. Super d\xF3cil, mas desconfiado de in\xEDcio.",
    status: "scheduled",
    reminderStatus: "none"
  }
];
var logs = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 36e5 * 2).toISOString(),
    type: "create",
    message: "Agendamento criado para Pipoca (Banho) por Equipe PetFamily."
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 36e5).toISOString(),
    type: "reminder_draft",
    message: "Lembrete autom\xE1tico pr\xE9-gerado para o Pipoca."
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 18e5).toISOString(),
    type: "reminder_sent",
    message: "Lembrete enviado com sucesso para Beatriz Mendes (Floquinho)."
  }
];
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new import_genai.GoogleGenAI({
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
function generateLocalEmailTemplate(apt) {
  const dateFormatted = new Date(apt.dateTime).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  const timeFormatted = new Date(apt.dateTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const emojiMap = {
    dog: "\u{1F43E}\u{1F415}",
    cat: "\u{1F43E}\u{1F431}",
    bird: "\u{1F99C}\u{1F424}",
    rabbit: "\u{1F430}\u{1F407}",
    other: "\u{1F43E}\u{1F43E}"
  };
  const emoji = emojiMap[apt.petType] || "\u{1F43E}";
  const serviceMap = {
    veterinary: "Consulta Veterin\xE1ria \u{1FA7A}",
    vaccination: "Aplica\xE7\xE3o de Vacina \u{1F489}",
    grooming: "Tosa Est\xE9tica \u2702\uFE0F",
    bath: "Banho Relaxante \u{1F9FC}",
    teeth: "Limpeza de T\xE1rtaro\u{1F9B7}",
    hotel: "Hospedagem Familiar \u{1F3E8}",
    other: "Servi\xE7o Especial \u{1F31F}"
  };
  const serviceName = serviceMap[apt.serviceType] || "Agendamento";
  const subject = `Lembrete importante: ${apt.petName} tem ${serviceName} na PetFamily! ${emoji}`;
  const body = `Ol\xE1, ${apt.ownerName}! 

Este \xE9 um lembrete autom\xE1tico da PetFamily passando pela sua tela para confirmar o agendamento do seu amado pet, o(a) ${apt.petName} (${apt.petBreed}).

\u{1F4C5} Detalhes do Compromisso:
\u2022 Servi\xE7o: ${serviceName}
\u2022 Data: ${dateFormatted}
\u2022 Hor\xE1rio anunciado: ${timeFormatted}
\u2022 Observa\xE7\xF5es do pet: ${apt.notes || "Nenhuma observa\xE7\xE3o especial registrada."}

\u{1F4CD} Estamos te esperando na Rua dos Pets, 123 (PetFamily Matriz). Se precisar remarcar ou tiver alguma d\xFAvida, por favor responda diretamente a este e-mail ou fale conosco pelo telefone/WhatsApp: (11) 4002-8922.

Obrigado por confiar o(a) ${apt.petName} \xE0 nossa equipe! Mal podemos esperar para dar todo o carinho e cuidado que ele(a) merece.

Com muito amor,
Equipe PetFamily \u{1F415}\u{1F408}\u200D\u2B1B\u{1F429}\u{1F407}\u2764\uFE0F`;
  return { subject, body };
}
app.get("/api/appointments", (req, res) => {
  res.json(appointments);
});
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
      return res.status(400).json({ error: "Faltam campos obrigat\xF3rios no formul\xE1rio." });
    }
    const newApt = {
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
    const localTemplate = generateLocalEmailTemplate(newApt);
    newApt.reminderStatus = "drafted";
    newApt.reminderEmailSubject = localTemplate.subject;
    newApt.reminderEmailBody = localTemplate.body;
    appointments.unshift(newApt);
    logs.unshift({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      type: "create",
      message: `Novo agendamento criado: ${newApt.petName} (${newApt.petBreed}) de ${newApt.ownerName}.`
    });
    res.status(201).json(newApt);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar compromisso: " + err.message });
  }
});
app.put("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Compromisso n\xE3o encontrado." });
  }
  const existing = appointments[index];
  const updated = { ...existing, ...req.body };
  if (req.body.dateTime !== existing.dateTime || req.body.serviceType !== existing.serviceType || req.body.petName !== existing.petName || req.body.notes !== existing.notes) {
    const updatedTemplate = generateLocalEmailTemplate(updated);
    updated.reminderEmailSubject = updatedTemplate.subject;
    updated.reminderEmailBody = updatedTemplate.body;
    updated.reminderStatus = "drafted";
  }
  appointments[index] = updated;
  logs.unshift({
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "update",
    message: `Agendamento editado: ${updated.petName} de ${updated.ownerName}.`
  });
  res.json(updated);
});
app.delete("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Compromisso n\xE3o encontrado." });
  }
  const deleted = appointments[index];
  appointments.splice(index, 1);
  logs.unshift({
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "delete",
    message: `Agendamento removido: ${deleted.petName} (${deleted.ownerName}).`
  });
  res.json({ message: "Compromisso deletado com sucesso." });
});
app.post("/api/appointments/:id/ai-reminder", async (req, res) => {
  const { id } = req.params;
  const appointment = appointments.find((a) => a.id === id);
  if (!appointment) {
    return res.status(404).json({ error: "Compromisso n\xE3o encontrado." });
  }
  const client = getGeminiClient();
  const mockReasonWhy = !client ? "Usando IA Base Local (Chave de API Gemini n\xE3o configurada nas Configura\xE7\xF5es do AI Studio. O template foi otimizado localmente)." : null;
  if (!client) {
    const template = generateLocalEmailTemplate(appointment);
    appointment.reminderEmailSubject = "\u{1F916} [IA] " + template.subject;
    appointment.reminderEmailBody = template.body + "\n\n---\n\u2728 Rascunho melhorado localmente (para super personaliza\xE7\xE3o com IA real, configure sua GEMINI_API_KEY no painel do AI Studio).";
    appointment.reminderStatus = "drafted";
    logs.unshift({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
    const aiPrompt = `Voc\xEA \xE9 o redator oficial do centro est\xE9tico e cl\xEDnica veterin\xE1ria "PetFamily".
Crie um e-mail de lembrete de compromisso acolhedor, profissional e criativo direcionado ao dono do animal dom\xE9stico.
Seja carinhoso e amig\xE1vel. Use emojis fofos condizentes com animais e cuidados.

Fatos do compromisso de atendimento:
- Nome do Pet: ${appointment.petName}
- Esp\xE9cie/Tipo: ${appointment.petType} (como ${appointment.petBreed || "sem ra\xE7a definida"})
- Nome do Dono(a): ${appointment.ownerName}
- Servi\xE7o agendado: ${appointment.serviceType}
- Data e Hora do atendimento: ${formattedDate}
- Observa\xE7\xF5es cr\xEDticas registradas pela equipe: ${appointment.notes || "Sem observa\xE7\xF5es espec\xEDficas."}

Voc\xEA deve retornar um JSON v\xE1lido contendo exatamente dois campos:
- subject: O t\xEDtulo/assunto do email que chame a aten\xE7\xE3o de forma fofa e alegre em portugu\xEAs.
- body: O corpo do email completo com quebras de linhas, carinho com o pet, instru\xE7\xF5es para trazer carteirinha caso seja consulta ou lembretes de jejum/shampoo caso aplic\xE1vel, e assinatura calorosa de PetFamily.

Retorne APENAS um objeto JSON limpo que possamos decodificar com JSON.parse. N\xE3o envolva em blocos markdown de c\xF3digo al\xE9m de json normais se necess\xE1rio ou apenas texto livre JSON.`;
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
    appointment.reminderEmailBody = parsed.body || "Ol\xE1 amigo pet!";
    appointment.reminderStatus = "drafted";
    logs.unshift({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      type: "reminder_draft",
      message: `Rascunho inteligente com Gemini AI gerado para ${appointment.petName}.`
    });
    res.json({
      success: true,
      subject: appointment.reminderEmailSubject,
      body: appointment.reminderEmailBody
    });
  } catch (err) {
    const template = generateLocalEmailTemplate(appointment);
    appointment.reminderEmailSubject = template.subject;
    appointment.reminderEmailBody = template.body;
    appointment.reminderStatus = "drafted";
    res.json({
      success: true,
      errorOccurred: true,
      message: "Rascunho gerado via template padr\xE3o (Ocorreu uma falha na chamada com a API Gemini).",
      subject: template.subject,
      body: template.body
    });
  }
});
app.post("/api/appointments/:id/send-reminder", (req, res) => {
  const { id } = req.params;
  const appointment = appointments.find((a) => a.id === id);
  if (!appointment) {
    return res.status(404).json({ error: "Compromisso n\xE3o encontrado." });
  }
  if (!appointment.reminderEmailSubject || !appointment.reminderEmailBody) {
    const template = generateLocalEmailTemplate(appointment);
    appointment.reminderEmailSubject = template.subject;
    appointment.reminderEmailBody = template.body;
  }
  appointment.reminderStatus = "sent";
  appointment.reminderSentAt = (/* @__PURE__ */ new Date()).toISOString();
  logs.unshift({
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
app.get("/api/logs", (req, res) => {
  res.json(logs);
});
app.post("/api/logs/clear", (req, res) => {
  logs = [];
  res.json({ message: "Logs limpos" });
});
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
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PetFamily server started and listening on http://0.0.0.0:${PORT}`);
  });
}
bootstrap();
//# sourceMappingURL=server.cjs.map
