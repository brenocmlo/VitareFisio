import { Request, Response } from "express";
import { CreateAutonomoService } from "../services/CreateAutonomoService";

export class RegistrationController {
    async signupAutonomo(req: Request, res: Response) {
        try {
            const data = req.body;
            const createAutonomo = new CreateAutonomoService();
            const result = await createAutonomo.execute(data);

            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
