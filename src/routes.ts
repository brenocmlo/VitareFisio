import { Router } from "express";

// --- CONTROLLERS ---
import { PacienteController } from "./modules/patients/controllers/PacienteController";
import { AgendamentoController } from "./modules/appointments/controllers/AgendamentoController";
import { EvolucaoController } from "./modules/appointments/controllers/EvolucaoController";
import { PacienteFinanceiroController } from "./modules/patients/controllers/PacienteFinanceiroController";
import { ReportController } from "./modules/clinics/controllers/ReportController";

// --- MIDDLEWARES E VALIDAÇÕES ---
import { validateRequest } from "./shared/middlewares/validateRequest";
import { createPacienteSchema } from "./modules/patients/schemas/createPacienteSchema";
import { createAgendamentoSchema } from "./modules/appointments/schemas/createAgendamentoSchema";
import { createEvolucaoSchema } from "./modules/appointments/schemas/createEvolucaoSchema";

// --- CONTROLLER DE PAGAMENTOS ---
import { PagamentoController } from "./modules/finance/controllers/PagamentoController";
import { createPagamentoSchema } from "./modules/finance/schemas/createPagamentoSchema";
import { ensureAuthenticated } from "./shared/middlewares/ensureAuthenticated";

// --- CONTROLLERS DE CLÍNICA ---
import { ClinicaController } from "./modules/clinics/controllers/ClinicaController";
import { FisioterapeutaController } from "./modules/clinics/controllers/FisioterapeutaController";
import { createClinicaSchema } from "./modules/clinics/schemas/createClinicaSchema";
import { createFisioterapeutaSchema } from "./modules/clinics/schemas/createFisioterapeutaSchema";
const routes = Router();

// --- USER CONTROLLER (Exemplo de outro módulo) ---//
import { UserController } from "./modules/users/controllers/UserController";
import { SessionsController } from "./modules/users/controllers/SessionsController";
import { createUserSchema } from "./modules/users/schemas/createUserSchema";

// --- DASHBOARD CONTROLLER ---//
import { DashboardController } from "./modules/dashboard/controllers/DashboardController";

// --- ANEXO CONTROLLER ---//
import multer from "multer";
import uploadConfig from "./config/upload";
import { AnexoController } from "./modules/patients/controllers/AnexoController";

// --- INSTÂNCIAS (Onde a "mágica" acontece) ---
// Verifique se estas 3 linhas existem. Sem o 'new', o controller fica undefined.
const pacienteController = new PacienteController();
const agendamentoController = new AgendamentoController();
const evolucaoController = new EvolucaoController(); 
const pagamentoController = new PagamentoController();
const pacienteFinanceiroController = new PacienteFinanceiroController();
const clinicaController = new ClinicaController();
const fisioterapeutaController = new FisioterapeutaController();
const userController = new UserController();
const sessionsController = new SessionsController();
const dashboardController = new DashboardController();
const upload = multer(uploadConfig);
const anexoController = new AnexoController();
const reportController = new ReportController();


// --- ROTAS DE PACIENTES ---
routes.post(
    "/pacientes", 
    validateRequest(createPacienteSchema), 
    pacienteController.create
);

routes.get(
    "/pacientes", 
    pacienteController.index
);

// --- ROTAS DE AGENDAMENTOS ---

// Criar Sessão
routes.post(
    "/agendamentos", 
    validateRequest(createAgendamentoSchema), 
    agendamentoController.create              
);

// Reagendar Sessão (Nova rota)
routes.patch(
    "/agendamentos/:id/reagendar", 
    agendamentoController.update
);
routes.patch(
    "/agendamentos/:id/reagendar", 
    agendamentoController.update
);
// --- ROTAS DE EVOLUÇÕES (PRONTUÁRIO) ---
// Linha 39: Garantimos que evolucaoController e o método create existem
routes.post(
    "/evolucoes", 
    validateRequest(createEvolucaoSchema), 
    evolucaoController.create // <-- O Express agora encontrará esta função
);
// --- ROTAS DE PAGAMENTOS ---
// --- ROTAS FINANCEIRAS ---
routes.get("/pagamentos", 
    ensureAuthenticated, 
    pagamentoController.index
);
routes.patch("/pagamentos/:id/baixa", 
    ensureAuthenticated, 
    pagamentoController.update
);
// --- ROTAS DE CLÍNICAS ---
routes.post("/clinicas", 
    validateRequest(createClinicaSchema), 
    clinicaController.create
);

// --- ROTAS DE FISIOTERAPEUTAS ---
routes.post("/fisioterapeutas", 
    validateRequest(createFisioterapeutaSchema), 
    fisioterapeutaController.create);

// Cadastro de novos usuários (Geralmente restrito a admins no futuro)
routes.post(
    "/usuarios", 
    validateRequest(createUserSchema), 
    userController.create
);

// Rota de Login (Gera o Token JWT)
routes.post(
    "/login", 
    sessionsController.create
);

// Dashboard - Só quem está logado vê os dados da sua clínica
routes.get("/dashboard", 
    ensureAuthenticated, 
    dashboardController.index
);

// Histórico de Evoluções do Paciente
routes.get("/pacientes/:paciente_id/evolucoes",
     ensureAuthenticated, 
     evolucaoController.index
    );

// Rota de Upload de Anexos
routes.post(
    "/pacientes/:paciente_id/anexos", 
    ensureAuthenticated, 
    upload.single("documento"), // "documento" é o nome do campo no formulário
    anexoController.create
);
// Visualizar Anexo
routes.get(
    "/anexos/:id", 
    ensureAuthenticated, 
    anexoController.show
);

// Rota para "Assinar/Finalizar" a evolução
routes.patch(
    "/evolucoes/:id/finalizar",
    ensureAuthenticated,
    evolucaoController.finalizeEvolucao
);

// Edição de Evolução (Sujeito à trava de 24h)
routes.put("/evolucoes/:id", 
    ensureAuthenticated, 
    evolucaoController.update
);

// Rota para exportar o prontuário do paciente em PDF
routes.get(
    "/pacientes/:paciente_id/relatorio", 
    ensureAuthenticated, 
    reportController.exportProntuario
);
export { routes };
