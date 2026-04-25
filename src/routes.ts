import { Router } from "express";
import multer from "multer";

// --- CONTROLLERS ---
import { UserController } from "./modules/users/controllers/UserController";
import { SessionsController } from "./modules/users/controllers/SessionsController";
import { ClinicaController } from "./modules/clinics/controllers/ClinicaController";
import { FisioterapeutaController } from "./modules/clinics/controllers/FisioterapeutaController";
import { PacienteController } from "./modules/patients/controllers/PacienteController";
import { PacoteController } from "./modules/patients/controllers/PacoteController";
import { AgendamentoController } from "./modules/appointments/controllers/AgendamentoController";
import { EvolucaoController } from "./modules/appointments/controllers/EvolucaoController";
import { PagamentoController } from "./modules/finance/controllers/PagamentoController";
import { DashboardController } from "./modules/clinics/controllers/DashboardController";
import { AnexoController } from "./modules/patients/controllers/AnexoController";
import { AnamneseController } from "./modules/patients/controllers/AnamneseController";
import { ReportController } from "./modules/clinics/controllers/ReportController";
import { RegistrationController } from "./modules/clinics/controllers/RegistrationController";
import { GoogleCalendarController } from "./modules/appointments/controllers/GoogleCalendarController";
import { ForgotPasswordController } from "./modules/users/controllers/ForgotPasswordController";

// --- MIDDLEWARES E VALIDAÇÕES ---
import { ensureAuthenticated } from "./shared/middlewares/ensureAuthenticated";
import { checkRole } from "./shared/middlewares/checkRole";
import { validateRequest } from "./shared/middlewares/validateRequest";

// --- SCHEMAS ---
import { createUserSchema } from "./modules/users/schemas/createUserSchema";
import { createClinicaSchema } from "./modules/clinics/schemas/createClinicaSchema";
import { createFisioterapeutaSchema } from "./modules/clinics/schemas/createFisioterapeutaSchema";
import { createPacienteSchema } from "./modules/patients/schemas/createPacienteSchema";
import { createAgendamentoSchema } from "./modules/appointments/schemas/createAgendamentoSchema";
import { createEvolucaoSchema } from "./modules/appointments/schemas/createEvolucaoSchema";
import { createPagamentoSchema } from "./modules/finance/schemas/createPagamentoSchema";
import { createAutonomoSchema } from "./modules/clinics/schemas/createAutonomoSchema";

const routes = Router();

/**
 * CONFIGURAÇÃO DO MULTER:
 * Alterado para memoryStorage para que o buffer do arquivo fique disponível
 * para o upload direto para o Supabase Storage.
 */
const upload = multer({ storage: multer.memoryStorage() });

// --- INSTÂNCIAS ---
const userController = new UserController();
const sessionsController = new SessionsController();
const forgotPasswordController = new ForgotPasswordController();
const clinicaController = new ClinicaController();
const fisioterapeutaController = new FisioterapeutaController();
const pacienteController = new PacienteController();
const pacoteController = new PacoteController();
const agendamentoController = new AgendamentoController();
const evolucaoController = new EvolucaoController();
const pagamentoController = new PagamentoController();
const dashboardController = new DashboardController();
const anexoController = new AnexoController();
const anamneseController = new AnamneseController();
const reportController = new ReportController();
const registrationController = new RegistrationController();
const googleCalendarController = new GoogleCalendarController(); // Nova Instância

// ==========================================
// 🔓 ROTAS PÚBLICAS (Sem Token)
// ==========================================
routes.get("/", (req, res) => res.json({ message: "VitareFisio API está online! 🚀" }));
routes.post("/password/forgot", forgotPasswordController.send);
routes.post("/password/reset", forgotPasswordController.reset);
routes.post("/usuarios", validateRequest(createUserSchema), userController.create);
routes.post("/clinicas", validateRequest(createClinicaSchema), clinicaController.create);
routes.post("/login", sessionsController.create);
routes.post("/signup/autonomo", validateRequest(createAutonomoSchema), registrationController.signupAutonomo);


// ==========================================
// 🔐 ROTAS PRIVADAS (Requerem Token JWT)
// ==========================================
// Removido o routes.use global para evitar bloqueios acidentais em rotas públicas

// --- INTEGRAÇÃO GOOGLE CALENDAR ---
routes.get("/google/auth", ensureAuthenticated, googleCalendarController.getAuthUrl);
routes.get("/google/callback", ensureAuthenticated, googleCalendarController.handleCallback);

// --- DASHBOARD ---
routes.get("/dashboard", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), dashboardController.getMetrics);

// --- GESTÃO DE EQUIPE ---
routes.post("/fisioterapeutas", ensureAuthenticated, checkRole(["admin"]), validateRequest(createFisioterapeutaSchema), fisioterapeutaController.create);
routes.get("/fisioterapeutas", ensureAuthenticated, checkRole(["admin", "recepcao"]), fisioterapeutaController.index);
routes.delete("/fisioterapeutas/:id", ensureAuthenticated, checkRole(["admin"]), fisioterapeutaController.delete);

// --- PACIENTES ---
routes.post("/pacientes", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), validateRequest(createPacienteSchema), pacienteController.create);
routes.get("/pacientes/cpf/:cpf", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), pacienteController.showByCpf);
routes.get("/pacientes", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), pacienteController.index);
routes.get("/pacientes/:id", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), pacienteController.show);
routes.delete("/pacientes/:id", ensureAuthenticated, checkRole(["admin"]), pacienteController.delete);

// --- PRONTUÁRIO CLÍNICO (ANAMNESE E EVOLUÇÕES) ---
routes.post("/pacientes/:paciente_id/anamnese", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), anamneseController.createOrUpdate);
routes.get("/pacientes/:paciente_id/anamnese", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), anamneseController.show);
routes.post("/evolucoes", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), validateRequest(createEvolucaoSchema), evolucaoController.create);
routes.get("/pacientes/:paciente_id/evolucoes", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), evolucaoController.index);
routes.put("/evolucoes/:id", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), evolucaoController.update);
routes.patch("/evolucoes/:id/finalizar", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), evolucaoController.finalize);

// --- PACOTES DE SESSÕES ---
routes.get("/pacientes/:paciente_id/pacotes", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), pacoteController.index);

// --- ANEXOS E DOCUMENTOS (SUPABASE STORAGE) ---
routes.post(
    "/pacientes/:paciente_id/anexos", 
    ensureAuthenticated,
    checkRole(["admin", "fisioterapeuta", "recepcao"]), 
    upload.single("documento"), 
    anexoController.create
);
routes.get("/pacientes/:paciente_id/anexos", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), anexoController.index);
routes.get("/anexos/:id", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), anexoController.show);
routes.delete("/anexos/:id", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), anexoController.delete);

// --- AGENDA E ATENDIMENTOS ---
routes.post("/agendamentos", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), validateRequest(createAgendamentoSchema), agendamentoController.create);
routes.patch("/agendamentos/:id/reagendar", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.update);
routes.patch("/agendamentos/:id/status", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.updateStatus);
routes.patch("/agendamentos/:id/cancelar", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.cancel); 
routes.get("/agendamentos", ensureAuthenticated, checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.index);
routes.get("/agendamentos/:id/lembrete", ensureAuthenticated, checkRole(["admin", "recepcao", "fisioterapeuta"]), agendamentoController.generateReminder);


// --- FINANCEIRO ---
routes.post("/pagamentos", ensureAuthenticated, checkRole(["admin", "recepcao", "fisioterapeuta"]), validateRequest(createPagamentoSchema), pagamentoController.create);
routes.get("/pagamentos", ensureAuthenticated, checkRole(["admin", "recepcao", "fisioterapeuta"]), pagamentoController.index);
routes.delete("/pagamentos/:id", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), pagamentoController.delete);

// --- RELATÓRIOS ---
routes.get("/pacientes/:paciente_id/relatorio", ensureAuthenticated, checkRole(["admin", "fisioterapeuta"]), reportController.exportProntuario);

export { routes };