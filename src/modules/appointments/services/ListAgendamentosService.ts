import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Between } from "typeorm";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

interface IRequest {
  data?: string;
  mes?: string;
  ano?: string;
  fisioterapeuta_id: number;
}

export class ListAgendamentosService {
  async execute({ data, mes, ano, fisioterapeuta_id }: IRequest) {
    const agendamentoRepo = AppDataSource.getRepository(Agendamento);

    let dataInicio: Date;
    let dataFim: Date;

    if (mes && ano) {
      // Filtro por Mês Inteiro
      const dataReferencia = new Date(Number(ano), Number(mes) - 1, 1);
      dataInicio = startOfMonth(dataReferencia);
      dataFim = endOfMonth(dataReferencia);
    } else if (data) {
      // Filtro por Dia Específico
      const dataReferencia = new Date(data);
      dataInicio = startOfDay(dataReferencia);
      dataFim = endOfDay(dataReferencia);
    } else {
      // Default: Hoje
      dataInicio = startOfDay(new Date());
      dataFim = endOfDay(new Date());
    }

    const agendamentos = await agendamentoRepo.find({
      where: {
        fisioterapeuta_id,
        data_hora: Between(dataInicio, dataFim),
      },
      relations: ["paciente"], // Para trazer o nome do paciente para a agenda
      order: { data_hora: "ASC" }
    });

    return agendamentos;
  }
}