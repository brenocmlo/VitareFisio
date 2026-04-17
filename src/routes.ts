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
import { DashboardController } from "./modules/dashboard/controllers/DashboardController";
import { AnexoController } from "./modules/patients/controllers/AnexoController";
import { ReportController } from "./modules/clinics/controllers/ReportController";

// --- MIDDLEWARES E VALIDAÇÕES ---
import { ensureAuthenticated } from "./shared/middlewares/ensureAuthenticated";
import { validateRequest } from "./shared/middlewares/validateRequest";
import { createUserSchema } from "./modules/users/schemas/createUserSchema";
import { createClinicaSchema } from "./modules/clinics/schemas/createClinicaSchema";
import { createFisioterapeutaSchema } from "./modules/clinics/schemas/createFisioterapeutaSchema";
import { createPacienteSchema } from "./modules/patients/schemas/createPacienteSchema";
import { createAgendamentoSchema } from "./modules/appointments/schemas/createAgendamentoSchema";
import { createEvolucaoSchema } from "./modules/appointments/schemas/createEvolucaoSchema";

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

// ==========================================
// 🔓 ROTAS PÚBLICAS
// ==========================================
routes.post("/usuarios", validateRequest(createUserSchema), userController.create);
routes.post("/clinicas", validateRequest(createClinicaSchema), clinicaController.create);
routes.post("/login", sessionsController.create);

// ==========================================
// 🔐 ROTAS PRIVADAS (Requerem Autenticação)
// ==========================================
routes.use(ensureAuthenticated);

// --- GESTÃO DE CLÍNICA & EQUIPE ---
routes.post("/fisioterapeutas", validateRequest(createFisioterapeutaSchema), fisioterapeutaController.create);
routes.get("/dashboard", dashboardController.index);

// --- PACIENTES ---
routes.post("/pacientes", validateRequest(createPacienteSchema), pacienteController.create);
routes.get("/pacientes", pacienteController.index);

// --- ANEXOS E DOCUMENTOS DO PACIENTE ---
routes.post("/pacientes/:paciente_id/anexos", upload.single("documento"), anexoController.create);
routes.get("/anexos/:id", anexoController.show);

// --- AGENDA E ATENDIMENTOS ---
routes.post("/agendamentos", validateRequest(createAgendamentoSchema), agendamentoController.create);
routes.patch("/agendamentos/:id/reagendar", agendamentoController.update); // Única e limpa

// --- PRONTUÁRIO (EVOLUÇÕES) ---
routes.post("/evolucoes", validateRequest(createEvolucaoSchema), evolucaoController.create);
routes.get("/pacientes/:paciente_id/evolucoes", evolucaoController.index);
routes.put("/evolucoes/:id", evolucaoController.update); // Trava de 24h tratada no Service
routes.patch("/evolucoes/:id/finalizar", evolucaoController.finalize); // Movi a lógica para o Controller!

// --- FINANCEIRO ---
routes.get("/pagamentos", pagamentoController.index);
routes.patch("/pagamentos/:id/baixa", pagamentoController.update);

// --- RELATÓRIOS ---
routes.get("/pacientes/:paciente_id/relatorio", reportController.exportProntuario);

export { routes };