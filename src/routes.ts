import { Router } from "express";

// --- CONTROLLERS ---
import { PacienteController } from "./modules/patients/controllers/PacienteController";
import { AgendamentoController } from "./modules/appointments/controllers/AgendamentoController";
import { EvolucaoController } from "./modules/appointments/controllers/EvolucaoController";
import { PacienteFinanceiroController } from "./modules/patients/controllers/PacienteFinanceiroController";

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
routes.post(
    "/pagamentos", 
    validateRequest(createPagamentoSchema), 
    pagamentoController.create
);
routes.get("/pacientes/:id/financeiro", 
    pacienteFinanceiroController.show
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
routes.post("/usuarios", validateRequest(createUserSchema), userController.create);

// Rota de Login (Gera o Token JWT)
routes.post("/login", sessionsController.create);

// Dashboard - Só quem está logado vê os dados da sua clínica
routes.get("/dashboard", 
    ensureAuthenticated, 
    dashboardController.index
);
export { routes };