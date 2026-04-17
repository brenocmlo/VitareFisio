import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/upload";

// --- CONTROLLERS ---
import { UserController } from "./modules/users/controllers/UserController";
import { SessionsController } from "./modules/users/controllers/SessionsController";
import { ClinicaController } from "./modules/clinics/controllers/ClinicaController";
import { FisioterapeutaController } from "./modules/clinics/controllers/FisioterapeutaController";
import { PacienteController } from "./modules/patients/controllers/PacienteController";
import { AgendamentoController } from "./modules/appointments/controllers/AgendamentoController";
import { EvolucaoController } from "./modules/appointments/controllers/EvolucaoController";
import { PagamentoController } from "./modules/finance/controllers/PagamentoController";
import { DashboardController } from "./modules/clinics/controllers/DashboardController"; // <-- CORRIGIDO
import { AnexoController } from "./modules/patients/controllers/AnexoController";
import { ReportController } from "./modules/clinics/controllers/ReportController";
import { RegistrationController } from "./modules/clinics/controllers/RegistrationController";
import { createAutonomoSchema } from "./modules/clinics/schemas/createAutonomoSchema";

// --- MIDDLEWARES E VALIDAÇÕES ---
import { ensureAuthenticated } from "./shared/middlewares/ensureAuthenticated";
import { validateRequest } from "./shared/middlewares/validateRequest";
import { createUserSchema } from "./modules/users/schemas/createUserSchema";
import { createClinicaSchema } from "./modules/clinics/schemas/createClinicaSchema";
import { createFisioterapeutaSchema } from "./modules/clinics/schemas/createFisioterapeutaSchema";
import { createPacienteSchema } from "./modules/patients/schemas/createPacienteSchema";
import { createAgendamentoSchema } from "./modules/appointments/schemas/createAgendamentoSchema";
import { createEvolucaoSchema } from "./modules/appointments/schemas/createEvolucaoSchema";
import { createPagamentoSchema } from "./modules/finance/schemas/createPagamentoSchema";

const routes = Router();
const upload = multer(uploadConfig);

// --- INSTÂNCIAS ---
const userController = new UserController();
const sessionsController = new SessionsController();
const clinicaController = new ClinicaController();
const fisioterapeutaController = new FisioterapeutaController();
const pacienteController = new PacienteController();
const agendamentoController = new AgendamentoController();
const evolucaoController = new EvolucaoController();
const pagamentoController = new PagamentoController();
const dashboardController = new DashboardController();
const anexoController = new AnexoController();
const reportController = new ReportController();
const registrationController = new RegistrationController();

// ==========================================
// 🔓 ROTAS PÚBLICAS
// ==========================================
routes.post("/usuarios", validateRequest(createUserSchema), userController.create);
routes.post("/clinicas", validateRequest(createClinicaSchema), clinicaController.create);
routes.post("/login", sessionsController.create);
routes.post("/signup/autonomo", validateRequest(createAutonomoSchema), registrationController.signupAutonomo);

// ==========================================
// 🔐 ROTAS PRIVADAS (Requerem Autenticação)
// ==========================================
routes.use(ensureAuthenticated);

// --- GESTÃO DE CLÍNICA & EQUIPE ---
routes.post("/fisioterapeutas", validateRequest(createFisioterapeutaSchema), fisioterapeutaController.create);
routes.get("/dashboard", dashboardController.getMetrics); // <-- CORRIGIDO

// --- PACIENTES ---
routes.post("/pacientes", validateRequest(createPacienteSchema), pacienteController.create);
routes.get("/pacientes", pacienteController.index);

// --- ANEXOS E DOCUMENTOS DO PACIENTE ---
routes.post("/pacientes/:paciente_id/anexos", upload.single("documento"), anexoController.create);
routes.get("/anexos/:id", anexoController.show);

// --- AGENDA E ATENDIMENTOS ---
routes.post("/agendamentos", validateRequest(createAgendamentoSchema), agendamentoController.create);
routes.patch("/agendamentos/:id/reagendar", agendamentoController.update);
routes.get("/agendamentos", agendamentoController.index);
routes.delete("/agendamentos/:id", agendamentoController.delete);

// --- PRONTUÁRIO (EVOLUÇÕES) ---
routes.post("/evolucoes", validateRequest(createEvolucaoSchema), evolucaoController.create);
routes.get("/pacientes/:paciente_id/evolucoes", evolucaoController.index);
routes.put("/evolucoes/:id", evolucaoController.update);
routes.patch("/evolucoes/:id/finalizar", evolucaoController.finalize);

// --- FINANCEIRO ---
routes.post("/pagamentos", validateRequest(createPagamentoSchema), pagamentoController.create);

// --- RELATÓRIOS ---
routes.get("/pacientes/:paciente_id/relatorio", reportController.exportProntuario);

// --- COMUNICAÇÃO ---
// Gerar link de WhatsApp para o lembrete da sessão
routes.get("/agendamentos/:id/lembrete", agendamentoController.generateReminder);

export { routes };
