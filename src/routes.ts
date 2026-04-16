import { Router } from "express";
import { PacienteController } from "./modules/patients/controllers/PacienteController";
import { validateRequest } from "./shared/middlewares/validateRequest";
import { createPacienteSchema } from "./modules/patients/schemas/createPacienteSchema";

const routes = Router();
const pacienteController = new PacienteController();

// Rota de Cadastro (Usa o Middleware do Zod)
routes.post(
    "/pacientes", 
    validateRequest(createPacienteSchema), 
    pacienteController.create
);

// Rota de Listagem (Não precisa de validação, pois não recebe dados)
routes.get(
    "/pacientes", 
    pacienteController.index
);

export { routes };