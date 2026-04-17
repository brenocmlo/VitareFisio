import { AppDataSource } from "../../../data-source";
import { Usuario } from "../../users/entities/Usuario";
import { Clinica } from "../entities/Clinica";
import { Fisioterapeuta } from "../entities/Fisioterapeuta";
import { hash } from "bcryptjs";

interface IRequest {
    nome: string;
    email: string;
    password: string;
    cpf: string;
    crefito: string;
    telefone?: string;
}

export class CreateAutonomoService {
    async execute({ nome, email, password, cpf, crefito, telefone }: IRequest) {
        const userRepository = AppDataSource.getRepository(Usuario);
        const clinicaRepository = AppDataSource.getRepository(Clinica);
        const fisioRepository = AppDataSource.getRepository(Fisioterapeuta);

        // 1. Verificar se usuário já existe
        const userExists = await userRepository.findOne({
            where: [{ email }, { cpf }]
        });
        if (userExists) throw new Error("Este e-mail já está em uso.");

        // 2. Criar a Clínica Virtual (Workspace)
        const clinica = clinicaRepository.create({
            nome_fantasia: `Consultório - ${nome}`,
            cnpj: cpf, // Para autônomos, usamos o CPF como identificador único de negócio
            telefone
        });
        await clinicaRepository.save(clinica);

        // 3. Criar o Usuário (Login)
        const hashedPassword = await hash(password, 8);
        const user = userRepository.create({
            nome,
            email,
            cpf,
            senha: hashedPassword,
            clinica_id: clinica.id,
            tipo: "fisioterapeuta"
        });
        await userRepository.save(user);

        // 4. Criar o Perfil do Fisioterapeuta
        const fisioterapeuta = fisioRepository.create({
            clinica_id: clinica.id,
            nome,
            crefito,
            email
        });
        await fisioRepository.save(fisioterapeuta);

        return {
            user: { id: user.id, nome: user.nome, email: user.email },
            clinica: { id: clinica.id, nome: clinica.nome_fantasia },
            fisioterapeuta: { id: fisioterapeuta.id, crefito: fisioterapeuta.crefito }
        };
    }
}
