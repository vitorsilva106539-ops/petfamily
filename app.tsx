import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Send, 
  CheckCircle, 
  X, 
  FileText, 
  MessageSquare, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  Scissors,
  Droplet,
  ShieldAlert,
  Home,
  Check,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Appointment, PetType, ServiceType, AppointmentStatus, ReminderStatus, ActivityLog, DashboardStats } from "./types";

export default function App() {
  // Application states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  
  // UI states
  const [activeTab, setActiveTab] = useState<"agenda" | "reminders" | "logs">("agenda");
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [aiGeneratingId, setAiGeneratingId] = useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Modal/Drawer for previewing/editing mail draft
  const [selectedMailDraft, setSelectedMailDraft] = useState<Appointment | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");

  // Appointment Form Fields State
  const [formPetName, setFormPetName] = useState("");
  const [formPetType, setFormPetType] = useState<PetType>("dog");
  const [formPetBreed, setFormPetBreed] = useState("");
  const [formOwnerName, setFormOwnerName] = useState("");
  const [formOwnerEmail, setFormOwnerEmail] = useState("");
  const [formOwnerPhone, setFormOwnerPhone] = useState("");
  const [formServiceType, setFormServiceType] = useState<ServiceType>("bath");
  const [formDateTime, setFormDateTime] = useState("");
  const [formDuration, setFormDuration] = useState("60");
  const [formNotes, setFormNotes] = useState("");

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptRes, logRes, statsRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/logs"),
        fetch("/api/dashboard-stats"),
      ]);

      if (!aptRes.ok || !logRes.ok || !statsRes.ok) {
        throw new Error("Falha ao comunicar com os serviços do servidor.");
      }

      const aptData = await aptRes.json();
      const logData = await logRes.json();
      const statsData = await statsRes.json();

      setAppointments(aptData);
      setLogs(logData);
      setStats(statsData);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro desconhecido ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show temp toast helper
  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Pre-load edit form
  const handleOpenEdit = (apt: Appointment) => {
    setEditingAppointment(apt);
    setFormPetName(apt.petName);
    setFormPetType(apt.petType);
    setFormPetBreed(apt.petBreed);
    setFormOwnerName(apt.ownerName);
    setFormOwnerEmail(apt.ownerEmail);
    setFormOwnerPhone(apt.ownerPhone);
    setFormServiceType(apt.serviceType);
    setFormDateTime(apt.dateTime);
    setFormDuration(String(apt.duration));
    setFormNotes(apt.notes);
    setIsFormOpen(true);
  };

  // Open creation form
  const handleOpenCreateInput = () => {
    setEditingAppointment(null);
    // Clear standard form
    setFormPetName("");
    setFormPetType("dog");
    setFormPetBreed("");
    setFormOwnerName("");
    setFormOwnerEmail("");
    setFormOwnerPhone("");
    setFormServiceType("bath");
    
    // Default time is tomorrow at 10 AM
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    tmr.setHours(10, 0, 0, 0);
    setFormDateTime(tmr.toISOString().substring(0, 16));
    setFormDuration("60");
    setFormNotes("");
    setIsFormOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPetName || !formOwnerName || !formOwnerEmail || !formDateTime) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      petName: formPetName,
      petType: formPetType,
      petBreed: formPetBreed || "Indefinida",
      ownerName: formOwnerName,
      ownerEmail: formOwnerEmail,
      ownerPhone: formOwnerPhone,
      serviceType: formServiceType,
      dateTime: formDateTime,
      duration: Number(formDuration),
      notes: formNotes,
    };

    try {
      let response;
      if (editingAppointment) {
        // PUT edit
        response = await fetch(`/api/appointments/${editingAppointment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // POST create
        response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error("Erro de requisição.");
      }

      showToast(
        editingAppointment
          ? "Compromisso atualizado e e-mail de lembrete reconfigurado!"
          : "Compromisso criado e rascunho de lembrete gerado!"
      );

      setIsFormOpen(false);
      setEditingAppointment(null);
      fetchData();
    } catch (err: any) {
      setErrorMessage("Não foi possível salvar o compromisso: " + err.message);
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar.");

      showToast("Compromisso removido com sucesso!");
      fetchData();
    } catch (err: any) {
      setErrorMessage("Erro ao deletar compromisso: " + err.message);
    }
  };

  // Generate AI automated custom reminder
  const handleGenerateAiReminder = async (id: string) => {
    setAiGeneratingId(id);
    try {
      const response = await fetch(`/api/appointments/${id}/ai-reminder`, {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao invocar Gemini.");

      if (data.mock) {
        showToast("Rascunho de E-mail otimizado com nossa IA Local. (API Key desconfigurada)");
      } else {
        showToast("Rascunho de E-mail de lembrete personalizado gerado com sucesso via Gemini AI! ✨🐾");
      }
      
      fetchData();
    } catch (err: any) {
      setErrorMessage("Erro ao processar com IA: " + err.message);
    } finally {
      setAiGeneratingId(null);
    }
  };

  // Launch Simulated Sender
  const handleSendReminder = async (id: string, customSubject?: string, customBody?: string) => {
    setSendingReminderId(id);
    try {
      // If we are sending custom draft, save it first on the backend representation
      if (customSubject && customBody) {
        await fetch(`/api/appointments/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reminderEmailSubject: customSubject,
            reminderEmailBody: customBody
          }),
        });
      }

      const response = await fetch(`/api/appointments/${id}/send-reminder`, {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Erro ao disparar envio.");

      showToast(`E-mail enviado de verdade (Simulador de Saída) para ${data.sentTo}! ✉️🚀`);
      setSelectedMailDraft(null); // close draft modal if opened
      fetchData();
    } catch (err: any) {
      setErrorMessage("Erro ao simular envio de e-mail: " + err.message);
    } finally {
      setSendingReminderId(null);
    }
  };

  // Quick edit of statuses
  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        showToast(`Status atualizado para: ${status === "confirmed" ? "Confirmado" : status === "cancelled" ? "Cancelado" : status === "completed" ? "Concluído" : "Agendado"}`);
        fetchData();
      }
    } catch (err: any) {
      setErrorMessage("Erro ao atualizar status: " + err.message);
    }
  };

  // Clear log list
  const clearLogs = async () => {
    try {
      await fetch("/api/logs/clear", { method: "POST" });
      setLogs([]);
      showToast("Histórico de logs limpo!");
    } catch (err: any) {}
  };

  // Generate 3-page complete system documentation PDF
  const generateSystemPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Natural Tones palette definitions
      const colorMoss = [126, 142, 107];       // #7E8E6B
      const colorDeepGreen = [74, 93, 35];     // #4A5D23
      const colorBrown = [139, 115, 85];       // #8B7355
      const colorSand = [237, 235, 224];       // #EDEBE0
      const colorOffWhite = [247, 246, 240];   // #F7F6F0
      const colorCharcoal = [61, 61, 51];      // #3D3D33

      // --- PAGE 1: COVER & INTRODUCTION ---
      // Decorative header background color block
      doc.setFillColor(colorDeepGreen[0], colorDeepGreen[1], colorDeepGreen[2]);
      doc.rect(0, 0, 210, 45, "F");

      // Brand name on top left
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("PetFamily - Painel Administrativo", 20, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Documento Oficial de Engenharia do Projeto", 20, 25);

      // Title & Cover Info
      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("MANUAL DO PROJETO PETFAMILY", 20, 65);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(colorBrown[0], colorBrown[1], colorBrown[2]);
      doc.text("Introducao Detalhada, Funcionalidades & Arquitetura", 20, 73);

      // Divider
      doc.setDrawColor(colorMoss[0], colorMoss[1], colorMoss[2]);
      doc.setLineWidth(1);
      doc.line(20, 80, 190, 80);

      // Introduction Text
      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("1. Introducao ao Projeto", 20, 95);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const introText1 = 
        "O PetFamily e um ecossistema digital de alta performance dedicado ao agendamento de atendimentos de medicina animal e servicos esteticos urbanos. O sistema oferece uma solucao ponta a ponta que otimiza o fluxo de atividades de clinicas veterinarias modernas, pet shops, resorts para pets e spas automaticos de higienizacao.";
      
      const introText2 = 
        "Desenvolvido sob o paradigma de arquitetura hibrida (Fullstack com Express e SPA em React), o PetFamily foca na simplicidade operacional para os profissionais de campo e na maxima clareza da experiencia para os tutores de animais de estimacao. Um dos pilares fundamentais da plataforma e a harmonizacao visual e usabilidade refinada, o que se expressa perfeitamente atraves da aplicacao do tema 'Natural Tones', fornecendo um ambiente de alta acessibilidade, calmo e receptivo para os administradores do sistema.";

      const introText3 = 
        "Este manual detalhado serve como documento referencial tecnico e operacional para toda a equipe, descrevendo as restricoes arquiteturais, mecanismos de controle de estado em tempo real, logica de filtros avancados de busca, bem como o inovador motor de customizacao textual baseado em Inteligencia Artificial utilizando Gemini AI.";

      const splitIntro1 = doc.splitTextToSize(introText1, 170);
      const splitIntro2 = doc.splitTextToSize(introText2, 170);
      const splitIntro3 = doc.splitTextToSize(introText3, 170);

      doc.text(splitIntro1, 20, 105);
      doc.text(splitIntro2, 20, 130);
      doc.text(splitIntro3, 20, 165);

      // Metadata card on Page 1 footer
      doc.setFillColor(colorSand[0], colorSand[1], colorSand[2]);
      doc.rect(20, 215, 170, 50, "F");
      
      doc.setTextColor(colorDeepGreen[0], colorDeepGreen[1], colorDeepGreen[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("ESPECIFICACOES DA PLATAFORMA", 25, 225);

      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);
      doc.setFont("helvetica", "normal");
      doc.text("- Autor Tecnico do Documento: Equipe PetFamily", 25, 232);
      doc.text("- Usuario Emitente: vitor.silva.106539@a.fecaf.com.br", 25, 238);
      doc.text("- Data Oficial do Registro: 25 de Maio de 2026", 25, 244);
      doc.text("- Versao Atualizada: v2.1.0-Release", 25, 250);

      // Page numbers on footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Pagina 1 de 3", 175, 285);

      // --- PAGE 2: FUNCTIONALITIES (AGENDA & FILTERS) ---
      doc.addPage();
      
      // Top colored bar
      doc.setFillColor(colorMoss[0], colorMoss[1], colorMoss[2]);
      doc.rect(0, 0, 210, 15, "F");

      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("2. Funcionalidade da Agenda e Filtros Avancados", 20, 32);

      doc.setDrawColor(colorSand[0], colorSand[1], colorSand[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 36, 190, 36);

      // Section: Agenda de Eventos
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(colorDeepGreen[0], colorDeepGreen[1], colorDeepGreen[2]);
      doc.text("2.1 Agenda de Eventos Dinamica (Painel Unificado)", 20, 46);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);
      
      const funcText1 =
        "A interface central do PetFamily consolida de forma inteligente todos os atendimentos cadastrados na base de dados, permitindo decisoes em tempo real. Cada card de atendimento possui:";
      doc.text(doc.splitTextToSize(funcText1, 170), 20, 52);

      const itemsList1 = [
        "Identificacao Clara do Pet: Tipo de animal (Cao, Gato, Ave, etc.), com badges visuais que melhoram a legibilidade imediata, alem de exibir o nome do pet e sua raca correspondente.",
        "Identidade do Servico: Badges de cores dedicadas que demonstram instantaneamente qual intervencao esta agendada (Banho, Tosa, Clinica Geral, Vacinas, Hospedagem).",
        "Informacoes de Contato do Tutor: Acesso imediato ao nome, telefone de contato e endereco de e-mail do responsavel, facilitando o dialogo em caso de urgencias medicas.",
        "Status de Atendimento Interativo: Seletor direto no card para sincronizar os estados (Agendado, Confirmado, Cancelado, Concluido) em conexao em tempo real com o servidor.",
        "Controles Operacionais Seguros: Botoes dedicados e redesenhados para edicao estruturada das informacoes e exclusao segura imediata, assegurando integridade na manipulacao."
      ];

      let listY = 62;
      itemsList1.forEach((item) => {
        doc.setFont("helvetica", "bold");
        doc.text("*", 20, listY);
        doc.setFont("helvetica", "normal");
        const itemLines = doc.splitTextToSize(item, 162);
        doc.text(itemLines, 25, listY);
        listY += (itemLines.length * 4.5) + 1.5;
      });

      // Section: Filtros de Busca Avançados
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(colorDeepGreen[0], colorDeepGreen[1], colorDeepGreen[2]);
      doc.text("2.2 Motores de Filtros & Pesquisa Progressiva", 20, listY + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);

      const filterText = 
        "Para suportar operacoes de alta densidade onde dezenas de pets sao agendados diariamente, o sistema conta com um motor de busca multifuncional instantaneo:\n\n" +
        "1. Busca Baseada em Texto: Procura no cliente por sequencias de texto correspondentes ao nome do pet, raca do animal, nome do tutor ou e-mail registrado.\n" +
        "2. Filtros de Classificacao Biologica: Filtro dedicado permitindo focar exclusivamente em especies especificas (Caes, Gatos, Coelhos, Aves).\n" +
        "3. Filtros de Tipo de Intervencao: Segmentacao imediata dos dados da mesa operacional para exibir servicos prioritarios, como cirurgias veterinarias ou banhos.";

      const splitFilter = doc.splitTextToSize(filterText, 170);
      doc.text(splitFilter, 20, listY + 11);

      // Page numbers on footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Pagina 2 de 3", 175, 285);

      // --- PAGE 3: AI REMINDERS & TECHNICAL CODE ---
      doc.addPage();
      
      // Top colored bar
      doc.setFillColor(colorDeepGreen[0], colorDeepGreen[1], colorDeepGreen[2]);
      doc.rect(0, 0, 210, 15, "F");

      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("3. Lembretes de IA & Especificacoes de Engenharia", 20, 32);

      doc.setDrawColor(colorSand[0], colorSand[1], colorSand[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 36, 190, 36);

      // Section: IA & Gemini
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(colorDeepGreen[0], colorDeepGreen[1], colorDeepGreen[2]);
      doc.text("3.1 Motor de Lembretes Inteligentes (Gemini AI)", 20, 46);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);

      const aiText1 = 
        "A plataforma PetFamily inova ao introduzir um robo gerador de lembretes que substitui e-mails genericos por comunicacoes personalizadas e ultra-afetuosas. Quando a chave 'GEMINI_API_KEY' e provisionada nos segredos seguros do servidor, o motor aciona o SDK da Google Gen AI (@google/genai) com o modelo mais agil do ecossistema Google.";

      const aiText2 =
        "O sistema formula um prompt contextualizado injetando automaticamente as especificidades do pet (como nome, raca e especie) e os dados de agendamento (dia, horario e detalhes do servico). O resultado e uma copia de e-mail pronta, gentil e que garante uma altissima taxa de resposta e engajamento dos tutores. Em caso de ausencia de credenciais externas, o servidor inteligentemente chaveia para um motor gerador heuristico local estruturado, prevenindo falhas na experiencia operacional.";

      doc.text(doc.splitTextToSize(aiText1, 170), 20, 52);
      doc.text(doc.splitTextToSize(aiText2, 170), 20, 78);

      // Technical Stack Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(colorDeepGreen[0], colorDeepGreen[1], colorDeepGreen[2]);
      doc.text("3.2 Stack Tecnologico & Padroes Industriais", 20, 118);

      // Formatted list for Tech stack
      const techList = [
        "Backend / Servidor: Node.js Express de alta concorrencia para APIs REST e barramento de dados nativo.",
        "Frontend / Interface: React v18 estruturado em componentes fortemente declarativos combinados com Framer Motion para micro-interacoes de feedback visual fluidas.",
        "Seguranca de Segredos: Separacao estrita dos tokens de acesso e chaves de API restritas ao ambiente do servidor proxy, evitando vazamento de dados confidenciais por meio do client-side do navegador.",
        "Design de Interacao: Folhas de estilo baseadas em Tailwind CSS v4 para garantir consistencia de proporcoes de layout, responsividade fluida sob premissas mobile-first e fidelidade cromatica com o tema corporativo Natural Tones."
      ];

      let techY = 125;
      techList.forEach((tech) => {
        doc.setFont("helvetica", "bold");
        doc.text("*", 20, techY);
        doc.setFont("helvetica", "normal");
        const techLines = doc.splitTextToSize(tech, 162);
        doc.text(techLines, 25, techY);
        techY += (techLines.length * 4.5) + 1.5;
      });

      // Verification seal on bottom
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(colorMoss[0], colorMoss[1], colorMoss[2]);
      doc.setLineWidth(0.5);
      doc.rect(20, 215, 170, 38, "S");

      doc.setTextColor(colorDeepGreen[0], colorDeepGreen[1], colorDeepGreen[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("CHANCELA DE VERIFICACAO OPERACIONAL", 25, 224);

      doc.setTextColor(colorCharcoal[0], colorCharcoal[1], colorCharcoal[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("Este manual de engenharia foi auditado eletronicamente e compilado de acordo com as especificidades", 25, 230);
      doc.text("tecnicas vigentes no provisionamento do ecossistema de servidores locais em port: 3000 do PetFamily S/A.", 25, 234);
      doc.text("A conformidade de design atende rigorosamente os criterios exigidos pelo padrao Natural Tones (Paleta Base).", 25, 238);

      // Signature line simulator
      doc.setDrawColor(200, 200, 200);
      doc.line(125, 246, 180, 246);
      doc.setFont("helvetica", "bold");
      doc.text("Diretoria de Engenharia", 132, 250);

      // Page numbers on footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Pagina 3 de 3", 175, 285);

      // Save PDF to disk
      doc.save("manual_petfamily_completo.pdf");
      showToast("Manual tecnico de 3 paginas (PDF) gerado e baixado com sucesso! 📄🐾");
    } catch (err: any) {
      setErrorMessage("Erro ao gerar o manual em PDF do sistema: " + err.message);
    }
  };

  // Format Helper
  const formatService = (service: ServiceType) => {
    switch (service) {
      case "veterinary": return { text: "Veterinária", color: "bg-red-50 text-red-700 border-red-100", icon: <CalendarIcon className="w-4 h-4 mr-1 text-red-500" /> };
      case "vaccination": return { text: "Vacinação", color: "bg-purple-50 text-purple-700 border-purple-100", icon: <Droplet className="w-4 h-4 mr-1 text-purple-500" /> };
      case "grooming": return { text: "Tosa Estética", color: "bg-amber-50 text-amber-700 border-amber-100", icon: <Scissors className="w-4 h-4 mr-1 text-amber-500" /> };
      case "bath": return { text: "Banho", color: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: <Droplet className="w-4 h-4 mr-1 text-indigo-500" /> };
      case "teeth": return { text: "Tártaro", color: "bg-cyan-50 text-cyan-700 border-cyan-100", icon: <Sparkles className="w-4 h-4 mr-1 text-cyan-500" /> };
      case "hotel": return { text: "Hospedagem", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <Home className="w-4 h-4 mr-1 text-emerald-500" /> };
      default: return { text: "Outros", color: "bg-gray-50 text-gray-700 border-gray-100", icon: <FileText className="w-4 h-4 mr-1 text-gray-500" /> };
    }
  };

  const getPetBadge = (type: PetType) => {
    switch(type) {
      case "dog": return { text: "🐶 Cão", style: "bg-orange-50 text-orange-700 border-orange-100" };
      case "cat": return { text: "🐱 Gato", style: "bg-sky-50 text-sky-700 border-sky-100" };
      case "bird": return { text: "🦜 Ave", style: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case "rabbit": return { text: "🐰 Coelho", style: "bg-pink-50 text-pink-700 border-pink-100" };
      default: return { text: "🐾 Outros", style: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  // Filter & search implementation
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.petBreed && apt.petBreed.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === "all" || apt.petType === typeFilter;
    const matchesService = serviceFilter === "all" || apt.serviceType === serviceFilter;

    return matchesSearch && matchesType && matchesService;
  });

  return (
    <div className="min-h-screen bg-[#F7F6F0] flex flex-col antialiased text-[#3D3D33]">
      {/* Dynamic Status Error notification bar */}
      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-100 text-rose-800 px-4 py-3 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating alert toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-brand-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 border border-brand-400 max-w-md font-sans"
          >
            <div className="bg-white/20 p-1.5 rounded-xl">
              <Check className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium leading-tight">{successToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col space-y-6 md:space-y-8">
        
        {/* Navigation & Brand Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-brand-250 border-brand-200 gap-4">
          <div className="flex items-center space-x-4">
            {/* Friendly Logo */}
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/10">
              <span className="text-2xl font-display font-medium">🐾</span>
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-neutral-800">
                PetFamily <span className="text-brand-500 text-lg md:text-2xl font-light font-sans ml-1">| Agenda Administrativa</span>
              </h1>
              <p className="text-sm text-neutral-500 font-sans mt-0.5">
                Central de compromissos veterinários, banhos, tosas e disparos automáticos de e-mail.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={generateSystemPdf}
              className="p-2.5 rounded-xl bg-[#EDEBE0] border border-[#DEDBCB] hover:border-[#7E8E6B] text-[#4A5D23] font-semibold transition-all flex items-center text-sm gap-2 cursor-pointer"
              title="Manual Completo de Funcionalidades em PDF"
            >
              <FileText className="w-4 h-4 text-[#7E8E6B]" />
              <span>Manual do Projeto (PDF)</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 transition-all flex items-center text-sm font-medium gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-500" : ""}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
            <button 
              id="btn-new-appointment"
              onClick={handleOpenCreateInput}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold transition-all flex items-center text-sm gap-2 shadow-md shadow-brand-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stats Panel */}
        <section id="stats-panel" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-sans">Total de Consultas</span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-display text-neutral-800">{stats?.total ?? appointments.length}</span>
              <span className="text-xs bg-neutral-50 text-neutral-600 px-2 py-0.5 rounded-full">Histórico</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-sans">Atendimentos Ativos</span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-display text-neutral-800">{stats?.scheduled ?? appointments.filter(a => a.status === "scheduled").length}</span>
              <span className="text-xs bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full font-medium">Próximos</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-sans">Lembretes Confirmados</span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-display text-neutral-800">{stats?.remindersSent ?? appointments.filter(a => a.reminderStatus === "sent").length}</span>
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Disparados</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-sans">E-mails Automáticos hoje</span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-display text-accent-brown">{stats?.nextReminders ?? appointments.filter(a => a.reminderStatus === "drafted" && a.status === "scheduled").length}</span>
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Otimizados</span>
            </div>
          </div>
        </section>

        {/* Workspace Central */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs flex flex-col overflow-hidden min-h-[500px]">
          
          {/* Internal Tab Filters & Header */}
          <div className="bg-brand-50 border-b border-neutral-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-brand-700 text-lg sm:text-xl flex items-center gap-2">
                📅 Agenda de Eventos
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Filtrar por Pet, Dono ou Raça..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-neutral-300 bg-white"
              />
            </div>
          </div>

          {/* Filters shelf */}
          <div className="bg-[#F7F6F0]/40 border-b border-neutral-100 px-6 py-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase font-sans">Filtros Avançados:</span>
            
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-neutral-500">Pet:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-neutral-200 px-2 py-1 rounded-lg text-xs font-medium text-neutral-600 focus:outline-none focus:border-neutral-300"
              >
                <option value="all">Todos os tipos</option>
                <option value="dog">Cão</option>
                <option value="cat">Gato</option>
                <option value="bird">Ave</option>
                <option value="rabbit">Coelho</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-neutral-500">Serviço:</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-white border border-neutral-200 px-2 py-1 rounded-lg text-xs font-medium text-neutral-600 focus:outline-none focus:border-neutral-300"
              >
                <option value="all">Todos os serviços</option>
                <option value="bath">Banho</option>
                <option value="grooming">Tosa Estética</option>
                <option value="veterinary">Consulta Clínica</option>
                <option value="vaccination">Vacinação</option>
                <option value="teeth">Odonto/Tártaro</option>
                <option value="hotel">Hospedagem</option>
              </select>
            </div>

            {(searchQuery || typeFilter !== "all" || serviceFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setServiceFilter("all");
                }}
                className="text-xs font-medium text-brand-500 hover:text-brand-600 underline underline-offset-2 ml-auto"
              >
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Active Content Rendering */}
          <div className="flex-grow p-6">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 animate-spin text-brand-500" />
                <p className="mt-4 text-sm text-neutral-400 font-sans">Carregando painel de agendamentos...</p>
              </div>
            ) : (
              <>
                {/* 1. AGENDA TAB VIEW */}
                {activeTab === "agenda" && (
                  <div className="space-y-4">
                    {filteredAppointments.length === 0 ? (
                      <div className="text-center py-16 bg-[#F7F6F0]/40 rounded-2xl border border-dashed border-neutral-200">
                        <CalendarIcon className="w-12 h-12 text-neutral-300 mx-auto" />
                        <h3 className="mt-4 font-display font-bold text-neutral-700">Nenhum agendamento encontrado</h3>
                        <p className="mt-1 text-xs text-neutral-400 font-sans max-w-sm mx-auto">
                          Não existem compromissos correspondentes à pesquisa. Deseja registrar um novo atendimento?
                        </p>
                        <button
                          onClick={handleOpenCreateInput}
                          className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Novo Agendamento
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                          {filteredAppointments.map((apt) => {
                            const svc = formatService(apt.serviceType);
                            const petBadge = getPetBadge(apt.petType);
                            const aptDate = new Date(apt.dateTime);
                            
                            return (
                              <motion.div
                                key={apt.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-neutral-100 hover:border-neutral-200 rounded-2xl p-5 hover:shadow-xs transition-all flex flex-col justify-between group relative overflow-hidden"
                              >
                                {/* Active status badge line */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-100">
                                  {apt.status === "confirmed" && <div className="h-full bg-emerald-500 w-full" />}
                                  {apt.status === "cancelled" && <div className="h-full bg-rose-500 w-full" />}
                                  {apt.status === "completed" && <div className="h-full bg-blue-500 w-full" />}
                                  {apt.status === "scheduled" && <div className="h-full bg-brand-500 w-half" />}
                                </div>

                                <div className="space-y-4">
                                  {/* Pet and service header */}
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold border ${petBadge.style} mr-1.5`}>
                                        {petBadge.text}
                                      </span>
                                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold border ${svc.color}`}>
                                        {svc.text}
                                      </span>
                                    </div>
                                    
                                    {/* Action dropdown or status select */}
                                    <div className="flex items-center space-x-1">
                                      <select
                                        value={apt.status}
                                        onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                                        className="bg-neutral-50 hover:bg-neutral-100 border-none text-[11px] font-bold text-neutral-600 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                                      >
                                        <option value="scheduled">⏱️ Agendado</option>
                                        <option value="confirmed">✅ Confirmado</option>
                                        <option value="cancelled">❌ Cancelado</option>
                                        <option value="completed">🐾 Concluído</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Central Details */}
                                  <div>
                                    <h4 className="font-display font-extrabold text-lg text-neutral-800">
                                      {apt.petName}
                                    </h4>
                                    <p className="text-xs text-neutral-500 font-sans">
                                      Raça: {apt.petBreed || "Sem raça definida"}
                                    </p>
                                  </div>

                                  {/* Date card */}
                                  <div className="bg-neutral-50 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs text-neutral-600">
                                      <span className="font-semibold flex items-center">
                                        <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 mr-1.5" />
                                        {aptDate.toLocaleDateString("pt-BR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric"
                                        })}
                                      </span>
                                      <span className="font-semibold flex items-center">
                                        <Clock className="w-3.5 h-3.5 text-neutral-400 mr-1.5" />
                                        {aptDate.toLocaleTimeString("pt-BR", {
                                          hour: "2-digit",
                                          minute: "2-digit"
                                        })} ({apt.duration} min)
                                      </span>
                                    </div>
                                  </div>

                                  {/* Tutore/Owner Info */}
                                  <div className="pt-2 border-t border-dotted border-neutral-100 space-y-1">
                                    <p className="text-xs font-semibold text-neutral-700 flex items-center">
                                      <User className="w-3 h-3 text-neutral-400 mr-1.5" />
                                      {apt.ownerName}
                                    </p>
                                    <p className="text-[11px] text-neutral-500 flex items-center max-w-[200px] overflow-hidden truncate">
                                      <Mail className="w-3 h-3 text-neutral-400 mr-1.5" />
                                      {apt.ownerEmail}
                                    </p>
                                    {apt.ownerPhone && (
                                      <p className="text-[11px] text-neutral-500 flex items-center">
                                        <Phone className="w-3 h-3 text-neutral-400 mr-1.5" />
                                        {apt.ownerPhone}
                                      </p>
                                    )}
                                  </div>

                                  {/* Notes block */}
                                  {apt.notes && (
                                    <div className="text-[11px] bg-amber-50/20 text-neutral-600 p-2 rounded-lg border border-amber-500/10 max-h-16 overflow-y-auto">
                                      <strong>Obs:</strong> {apt.notes}
                                    </div>
                                  )}
                                </div>

                                {/* Custom controls and Trigger Reminders */}
                                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                                  {/* Email reminder indicator status */}
                                  <div className="flex items-center space-x-1">
                                    {apt.reminderStatus === "sent" ? (
                                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold flex items-center">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Enviado
                                      </span>
                                    ) : apt.reminderStatus === "drafted" ? (
                                      <span className="text-[10px] text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full font-bold flex items-center">
                                        <FileText className="w-3 h-3 mr-1" /> Pronto
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full font-bold flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" /> S/ Lembrete
                                      </span>
                                    )}
                                  </div>

                                  {/* Management buttons */}
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleOpenEdit(apt);
                                      }}
                                      title="Editar Compromisso"
                                      className="p-2 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all cursor-pointer z-10 relative"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 pointer-events-none" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (window.confirm(`Tem certeza que deseja excluir o compromisso de ${apt.petName}?`)) {
                                          handleDeleteAppointment(apt.id);
                                        }
                                      }}
                                      title="Excluir Compromisso"
                                      className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer z-10 relative"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                                    </button>
                                    
                                    {/* Action button to generate AI text or open preview */}
                                    <button
                                      onClick={() => {
                                        setSelectedMailDraft(apt);
                                        setDraftSubject(apt.reminderEmailSubject || "");
                                        setDraftBody(apt.reminderEmailBody || "");
                                      }}
                                      title="Ver Lembrete de Email"
                                      className="px-2.5 py-1.5 font-bold text-[10px] bg-brand-100 text-brand-700 hover:bg-brand-500 hover:text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Mail className="w-3 h-3" />
                                      Lembrete
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 bg-white border-t border-brand-100 font-sans text-xs text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-neutral-500 font-display">PetFamily Matriz S/A - Painel da Equipe</p>
          <p>© 2026 PetFamily. Todos os agendamentos e lembretes automáticos estão seguros sob as políticas internas de cuidados animais.</p>
        </div>
      </footer>

      {/* APPOINTMENT FORM DRAWER / INTERACTIVE MODAL OVERLAY */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-xl mx-auto overflow-hidden shadow-2xl border border-neutral-100"
            >
              <div className="p-6 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-neutral-800">
                    {editingAppointment ? "✏️ Editar Agendamento" : "📋 Novo Atendimento"}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Defina o pet, tutor e serviço com carinho.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-200 transition-all text-neutral-500 hover:text-brand-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {/* Pet Fields Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider font-sans">Identificação do Pet</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Tipo de Animal *</label>
                      <select
                        value={formPetType}
                        onChange={(e) => setFormPetType(e.target.value as PetType)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300"
                      >
                        <option value="dog">Dog (Cão)</option>
                        <option value="cat">Gato</option>
                        <option value="bird">Pássaro/Ave</option>
                        <option value="rabbit">Coelho</option>
                        <option value="other">Outros</option>
                      </select>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Nome do Pet *</label>
                      <input
                        type="text"
                        placeholder="Ex: Pipoca, Mingau"
                        required
                        value={formPetName}
                        onChange={(e) => setFormPetName(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">Raça do Animal</label>
                    <input
                      type="text"
                      placeholder="Ex: Golden Retriever, Persa, Vira-lata"
                      value={formPetBreed}
                      onChange={(e) => setFormPetBreed(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300"
                    />
                  </div>
                </div>

                {/* Owner Fields Section */}
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider font-sans">Contato do Tutor (Responsável)</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">Nome do Responsável *</label>
                    <input
                      type="text"
                      placeholder="Ex: Mariana de Souza"
                      required
                      value={formOwnerName}
                      onChange={(e) => setFormOwnerName(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">E-mail para Lembrete *</label>
                      <input
                        type="email"
                        placeholder="Ex: mariana@gmail.com"
                        required
                        value={formOwnerEmail}
                        onChange={(e) => setFormOwnerEmail(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">WhatsApp / Telefone</label>
                      <input
                        type="text"
                        placeholder="Ex: (11) 98765-4321"
                        value={formOwnerPhone}
                        onChange={(e) => setFormOwnerPhone(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule details */}
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider font-sans">Dados do Atendimento</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Serviço *</label>
                      <select
                        value={formServiceType}
                        onChange={(e) => setFormServiceType(e.target.value as ServiceType)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300"
                      >
                        <option value="bath">🧼 Banho</option>
                        <option value="grooming">✂️ Tosa Estética</option>
                        <option value="veterinary">🩺 Consulta Clínica</option>
                        <option value="vaccination">💉 Vacinação</option>
                        <option value="teeth">🦷 Limpeza Tártaro</option>
                        <option value="hotel">🏨 Hospedagem</option>
                        <option value="other">🌟 Especial</option>
                      </select>
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Duração (Minutos)</label>
                      <input
                        type="number"
                        min="10"
                        max="2880"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300"
                      />
                    </div>

                    <div className="col-span-1 border-neutral-200">
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Data / Hora *</label>
                      <input
                        type="datetime-local"
                        required
                        value={formDateTime}
                        onChange={(e) => setFormDateTime(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-200 focus:border-neutral-300 focus:outline bg-white font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">Observações / Alergias / Instruções</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Alergias a produtos, recomendação de tosa, vacina pendente no cadastro..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-neutral-300 resize-none"
                    />
                  </div>
                </div>

                {/* Submit Action footer */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/10 cursor-pointer"
                  >
                    {editingAppointment ? "Confirmar Mudanças" : "Agendar e Criar Lembrete"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED DRAFT EMAIL PREVIEW / EDIT DRAWER */}
      <AnimatePresence>
        {selectedMailDraft && (
          <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl mx-auto overflow-hidden shadow-2xl border border-neutral-100"
            >
              <div className="p-6 bg-neutral-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✉️</span>
                    <h3 className="font-display font-extrabold text-lg text-white">
                      Rascunho do Lembrete Automático por E-mail
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Revise e edite a mensagem inteligente criada para o tutor do <strong>{selectedMailDraft.petName}</strong> de forma real.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMailDraft(null)}
                  className="p-1 rounded-full hover:bg-white/10 transition-all text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                
                {/* Meta details regarding SMTP / Mail Client */}
                <div className="grid grid-cols-2 gap-4 bg-[#F7F6F0] p-3 rounded-xl border border-neutral-200/60 text-xs text-neutral-600 font-sans">
                  <div>
                    <span className="font-bold text-neutral-400 block mb-0.5 uppercase tracking-wider text-[9px]">Destinatário Tutor:</span>
                    <strong className="text-neutral-800">{selectedMailDraft.ownerName}</strong>
                    <span className="block italic text-neutral-510 text-neutral-500 font-medium">{selectedMailDraft.ownerEmail}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-400 block mb-0.5 uppercase tracking-wider text-[9px]">Status do Disparo:</span>
                    {selectedMailDraft.reminderStatus === "sent" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● Enviado {selectedMailDraft.reminderSentAt ? `em ${new Date(selectedMailDraft.reminderSentAt).toLocaleTimeString("pt-BR")}` : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 border border-brand-300">
                        ● Pronto para envio (Aguardando Disparo)
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Inputs to manually tweak email headers */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Título / Assunto Contato:</label>
                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 font-sans text-neutral-800"
                      placeholder="Coloque um assunto motivador..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Mensagem de E-mail Estimulante:</label>
                    <textarea
                      rows={12}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500 font-mono text-neutral-700 leading-relaxed font-sans"
                      placeholder="Redija o corpo do seu e-mail aqui..."
                    />
                  </div>
                </div>

                {/* Info and Call-to-actions */}
                <div className="bg-brand-50/50 p-3 rounded-xl border border-brand-100 flex items-center space-x-2.5">
                  <AlertCircle className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <p className="text-[11px] text-neutral-600 font-medium">
                    Clicar no botão dispara de forma imediata o log simulado no servidor e atualiza o estado para "Enviado".
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleGenerateAiReminder(selectedMailDraft.id).then(() => {
                      const updated = appointments.find(a => a.id === selectedMailDraft.id);
                      if (updated) {
                        setDraftSubject(updated.reminderEmailSubject || "");
                        setDraftBody(updated.reminderEmailBody || "");
                      }
                    })}
                    className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold border border-brand-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-650" />
                    <span>Regerar com Gemini AI</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMailDraft(null)}
                      className="px-4 py-2 font-bold text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs cursor-pointer"
                    >
                      Voltar ao Painel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReminder(selectedMailDraft.id, draftSubject, draftBody)}
                      className="px-5 py-2 font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/15 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simular Disparo Oficial</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
