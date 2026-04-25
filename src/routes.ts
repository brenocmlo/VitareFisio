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
routes.post("/password/forgot", forgotPasswordController.send);
routes.post("/password/reset", forgotPasswordController.reset);
routes.post("/usuarios", validateRequest(createUserSchema), userController.create);
routes.post("/clinicas", validateRequest(createClinicaSchema), clinicaController.create);
routes.post("/login", sessionsController.create);
routes.post("/signup/autonomo", validateRequest(createAutonomoSchema), registrationController.signupAutonomo);


// ==========================================
// 🔐 ROTAS PRIVADAS (Requerem Token JWT)
// ==========================================
routes.use(ensureAuthenticated);

// --- INTEGRAÇÃO GOOGLE CALENDAR ---
// Rota para iniciar o fluxo de autorização (gera a URL)
routes.get("/google/auth", googleCalendarController.getAuthUrl);
// Rota de callback que o Google chama (deve ser a mesma do seu .env e do Google Console)
routes.get("/google/callback", googleCalendarController.handleCallback);

// --- DASHBOARD ---
routes.get("/dashboard", checkRole(["admin", "fisioterapeuta", "recepcao"]), dashboardController.getMetrics);

// --- GESTÃO DE EQUIPE ---
routes.post("/fisioterapeutas", checkRole(["admin"]), validateRequest(createFisioterapeutaSchema), fisioterapeutaController.create);
routes.get("/fisioterapeutas", checkRole(["admin", "recepcao"]), fisioterapeutaController.index);
routes.delete("/fisioterapeutas/:id", checkRole(["admin"]), fisioterapeutaController.delete);

// --- PACIENTES ---
routes.post("/pacientes", checkRole(["admin", "fisioterapeuta", "recepcao"]), validateRequest(createPacienteSchema), pacienteController.create);
routes.get("/pacientes/cpf/:cpf", checkRole(["admin", "fisioterapeuta", "recepcao"]), pacienteController.showByCpf);
routes.get("/pacientes", checkRole(["admin", "fisioterapeuta", "recepcao"]), pacienteController.index);
routes.get("/pacientes/:id", checkRole(["admin", "fisioterapeuta", "recepcao"]), pacienteController.show);
routes.delete("/pacientes/:id", checkRole(["admin"]), pacienteController.delete);

// --- PRONTUÁRIO CLÍNICO (ANAMNESE E EVOLUÇÕES) ---
routes.post("/pacientes/:paciente_id/anamnese", checkRole(["admin", "fisioterapeuta"]), anamneseController.createOrUpdate);
routes.get("/pacientes/:paciente_id/anamnese", checkRole(["admin", "fisioterapeuta"]), anamneseController.show);
routes.post("/evolucoes", checkRole(["admin", "fisioterapeuta"]), validateRequest(createEvolucaoSchema), evolucaoController.create);
routes.get("/pacientes/:paciente_id/evolucoes", checkRole(["admin", "fisioterapeuta"]), evolucaoController.index);
routes.put("/evolucoes/:id", checkRole(["admin", "fisioterapeuta"]), evolucaoController.update);
routes.patch("/evolucoes/:id/finalizar", checkRole(["admin", "fisioterapeuta"]), evolucaoController.finalize);

// --- PACOTES DE SESSÕES ---
routes.get("/pacientes/:paciente_id/pacotes", checkRole(["admin", "fisioterapeuta", "recepcao"]), pacoteController.index);

// --- ANEXOS E DOCUMENTOS (SUPABASE STORAGE) ---
routes.post(
    "/pacientes/:paciente_id/anexos", 
    checkRole(["admin", "fisioterapeuta", "recepcao"]), 
    upload.single("documento"), 
    anexoController.create
);
routes.get("/pacientes/:paciente_id/anexos", checkRole(["admin", "fisioterapeuta", "recepcao"]), anexoController.index);
routes.get("/anexos/:id", checkRole(["admin", "fisioterapeuta", "recepcao"]), anexoController.show);
routes.delete("/anexos/:id", checkRole(["admin", "fisioterapeuta"]), anexoController.delete);

// --- AGENDA E ATENDIMENTOS ---
routes.post("/agendamentos", checkRole(["admin", "fisioterapeuta", "recepcao"]), validateRequest(createAgendamentoSchema), agendamentoController.create);
routes.patch("/agendamentos/:id/reagendar", checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.update);
routes.patch("/agendamentos/:id/status", checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.updateStatus);
routes.patch("/agendamentos/:id/cancelar", checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.cancel); 
routes.get("/agendamentos", checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.index);
routes.get("/agendamentos/:id/lembrete", checkRole(["admin", "recepcao", "fisioterapeuta"]), agendamentoController.generateReminder);


// --- FINANCEIRO ---
routes.post("/pagamentos", checkRole(["admin", "recepcao", "fisioterapeuta"]), validateRequest(createPagamentoSchema), pagamentoController.create);
routes.get("/pagamentos", checkRole(["admin", "recepcao", "fisioterapeuta"]), pagamentoController.index);
routes.delete("/pagamentos/:id", checkRole(["admin", "fisioterapeuta"]), pagamentoController.delete);

// --- RELATÓRIOS ---
routes.get("/pacientes/:paciente_id/relatorio", checkRole(["admin", "fisioterapeuta"]), reportController.exportProntuario);

export { routes };