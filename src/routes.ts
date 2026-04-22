import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/upload";

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
const upload = multer(uploadConfig);

// --- INSTÂNCIAS ---
const userController = new UserController();
const sessionsController = new SessionsController();
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

// ==========================================
// 🔓 ROTAS PÚBLICAS (Sem Token)
// ==========================================
routes.post("/usuarios", validateRequest(createUserSchema), userController.create);
routes.post("/clinicas", validateRequest(createClinicaSchema), clinicaController.create);
routes.post("/login", sessionsController.create);
routes.post("/signup/autonomo", validateRequest(createAutonomoSchema), registrationController.signupAutonomo);


// ==========================================
// 🔐 ROTAS PRIVADAS (Requerem Token JWT)
// ==========================================
routes.use(ensureAuthenticated);

// --- DASHBOARD ---
// Todos os perfis podem ver o dashboard (a lógica de exibir os dados de acordo com o perfil deve ficar no controller)
routes.get("/dashboard", checkRole(["admin", "fisioterapeuta", "recepcao"]), dashboardController.getMetrics);


// --- GESTÃO DE EQUIPE ---
// Apenas o Admin cadastra novos fisioterapeutas
routes.post("/fisioterapeutas", checkRole(["admin"]), validateRequest(createFisioterapeutaSchema), fisioterapeutaController.create);
// Admin e Recepção podem listar quem compõe a equipe
routes.get("/fisioterapeutas", checkRole(["admin", "recepcao"]), fisioterapeutaController.index);


// --- PACIENTES ---
// Todos podem visualizar e cadastrar pacientes
routes.post("/pacientes", checkRole(["admin", "fisioterapeuta", "recepcao"]), validateRequest(createPacienteSchema), pacienteController.create);
routes.get("/pacientes", checkRole(["admin", "fisioterapeuta", "recepcao"]), pacienteController.index);
routes.get("/pacientes/:id", checkRole(["admin", "fisioterapeuta", "recepcao"]), pacienteController.show);
// Apenas Admin deveria deletar registros
routes.delete("/pacientes/:id", checkRole(["admin"]), pacienteController.delete);


// --- PRONTUÁRIO CLÍNICO (ANAMNESE E EVOLUÇÕES) ---
// SOMENTE Fisioterapeuta e Admin têm acesso aos dados de saúde (Recepção não)
routes.post("/pacientes/:paciente_id/anamnese", checkRole(["admin", "fisioterapeuta"]), anamneseController.createOrUpdate);
routes.get("/pacientes/:paciente_id/anamnese", checkRole(["admin", "fisioterapeuta"]), anamneseController.show);

routes.post("/evolucoes", checkRole(["admin", "fisioterapeuta"]), validateRequest(createEvolucaoSchema), evolucaoController.create);
routes.get("/pacientes/:paciente_id/evolucoes", checkRole(["admin", "fisioterapeuta"]), evolucaoController.index);
routes.put("/evolucoes/:id", checkRole(["admin", "fisioterapeuta"]), evolucaoController.update);
routes.patch("/evolucoes/:id/finalizar", checkRole(["admin", "fisioterapeuta"]), evolucaoController.finalize);


// --- PACOTES DE SESSÕES ---
routes.get("/pacientes/:paciente_id/pacotes", checkRole(["admin", "fisioterapeuta", "recepcao"]), pacoteController.index);


// --- ANEXOS E DOCUMENTOS ---
// Acesso liberado a todos, pois a recepção pode precisar anexar guias/encaminhamentos médicos
routes.post("/pacientes/:paciente_id/anexos", checkRole(["admin", "fisioterapeuta", "recepcao"]), upload.single("documento"), anexoController.create);
routes.get("/pacientes/:paciente_id/anexos", checkRole(["admin", "fisioterapeuta", "recepcao"]), anexoController.index);
routes.get("/anexos/:id", checkRole(["admin", "fisioterapeuta", "recepcao"]), anexoController.show);
routes.delete("/anexos/:id", checkRole(["admin", "fisioterapeuta"]), anexoController.delete);


// --- AGENDA E ATENDIMENTOS ---
// Todos podem gerenciar a agenda geral
routes.post("/agendamentos", checkRole(["admin", "fisioterapeuta", "recepcao"]), validateRequest(createAgendamentoSchema), agendamentoController.create);
routes.patch("/agendamentos/:id/reagendar", checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.update);
routes.patch("/agendamentos/:id/status", checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.updateStatus);
routes.get("/agendamentos", checkRole(["admin", "fisioterapeuta", "recepcao"]), agendamentoController.index);
// Lembrete WhatsApp
routes.get("/agendamentos/:id/lembrete", checkRole(["admin", "recepcao", "fisioterapeuta"]), agendamentoController.generateReminder);
// Deletar agendamento (Admin e Recepção)
routes.delete("/agendamentos/:id", checkRole(["admin", "recepcao"]), agendamentoController.delete);


// --- FINANCEIRO ---
// Admin e Recepção podem lançar pagamentos. Fisioterapeuta só deve listar para ver os seus
routes.post("/pagamentos", checkRole(["admin", "recepcao"]), validateRequest(createPagamentoSchema), pagamentoController.create);
routes.get("/pagamentos", checkRole(["admin", "recepcao", "fisioterapeuta"]), pagamentoController.index);
routes.delete("/pagamentos/:id", checkRole(["admin"]), pagamentoController.delete);


// --- RELATÓRIOS ---
routes.get("/pacientes/:paciente_id/relatorio", checkRole(["admin", "fisioterapeuta"]), reportController.exportProntuario);


export { routes };