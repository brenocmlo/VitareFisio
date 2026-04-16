import { Router } from "express";

// --- CONTROLLERS ---
import { PacienteController } from "./modules/patients/controllers/PacienteController";
import { AgendamentoController } from "./modules/appointments/controllers/AgendamentoController";
import { EvolucaoController } from "./modules/appointments/controllers/EvolucaoController";

// --- MIDDLEWARES E VALIDAÇÕES ---
import { validateRequest } from "./shared/middlewares/validateRequest";
import { createPacienteSchema } from "./modules/patients/schemas/createPacienteSchema";
import { createAgendamentoSchema } from "./modules/appointments/schemas/createAgendamentoSchema";
import { createEvolucaoSchema } from "./modules/appointments/schemas/createEvolucaoSchema";

const routes = Router();

// --- INSTÂNCIAS (Onde a "mágica" acontece) ---
// Verifique se estas 3 linhas existem. Sem o 'new', o controller fica undefined.
const pacienteController = new PacienteController();
const agendamentoController = new AgendamentoController();
const evolucaoController = new EvolucaoController(); 

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
routes.post(
    "/agendamentos", 
    validateRequest(createAgendamentoSchema), 
    agendamentoController.create              
);

routes.get(
    "/agendamentos", 
    agendamentoController.index
);

// --- ROTAS DE EVOLUÇÕES (PRONTUÁRIO) ---
// Linha 39: Garantimos que evolucaoController e o método create existem
routes.post(
    "/evolucoes", 
    validateRequest(createEvolucaoSchema), 
    evolucaoController.create // <-- O Express agora encontrará esta função
);

export { routes };