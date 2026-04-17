import { hash } from "bcryptjs";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";

interface IRequest {
    nome: string;
    email: string;
    cpf: string; // ADICIONADO
    senha: string;
    clinica_id?: number;
    tipo: string;
}

export class CreateUserService {
    async execute({ nome, email, cpf, senha, clinica_id, tipo }: IRequest) {
        const usuarioRepository = AppDataSource.getRepository(Usuario);

        // Verificar se e-mail ou CPF já existem
        const usuarioExiste = await usuarioRepository.findOne({
            where: [{ email }, { cpf }]
        });

        if (usuarioExiste) {
            throw new Error("E-mail ou CPF já cadastrado.");
        }

        const senhaCriptografada = await hash(senha, 8);

        const usuario = usuarioRepository.create({
            nome,
            email,
            cpf, // ENVIANDO PARA O BANCO
            senha: senhaCriptografada,
            clinica_id,
            tipo
        });

        await usuarioRepository.save(usuario);
        return usuario;
    }
}