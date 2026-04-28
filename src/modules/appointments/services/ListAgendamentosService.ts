import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Between } from "typeorm";

interface IRequest {
  data?: string;
  mes?: string;
  ano?: string;
  fisioterapeuta_id: number;
  clinica_id?: number;
  is_autonomo?: boolean;
}

export class ListAgendamentosService {
  async execute({ data, mes, ano, fisioterapeuta_id, clinica_id, is_autonomo }: IRequest) {
    const agendamentoRepo = AppDataSource.getRepository(Agendamento);

    let dataInicio: Date;
    let dataFim: Date;

    if (mes && ano) {
      const year = parseInt(ano, 10);
      const month = parseInt(mes, 10) - 1; // JS months are 0-indexed
      dataInicio = new Date(year, month, 1, 0, 0, 0);
      dataFim = new Date(year, month + 1, 0, 23, 59, 59); // Last day of month
    } else if (data) {
      const [year, month, day] = data.split('-').map(Number);
      dataInicio = new Date(year, month - 1, day, 0, 0, 0);
      dataFim = new Date(year, month - 1, day, 23, 59, 59);
    } else {
      const now = new Date();
      dataInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      dataFim = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }

    const where: any = {
      fisioterapeuta_id,
      data_hora: Between(dataInicio, dataFim),
    };

    if (!is_autonomo && clinica_id) {
      where.clinica_id = clinica_id;
    }

    const agendamentos = await agendamentoRepo.find({
      where,
      relations: ["paciente"],
      order: { data_hora: "ASC" }
    });

    return agendamentos;
  }
}
