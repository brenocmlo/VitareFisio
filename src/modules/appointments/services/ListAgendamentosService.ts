import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Between } from "typeorm";
import {
  getAppointmentDayBounds,
  getAppointmentMonthBounds,
  getCurrentAppointmentDateTime,
} from "../utils/appointmentDateTime";

interface IRequest {
  data?: string;
  mes?: string;
  ano?: string;
  fisioterapeuta_id: number;
}

export class ListAgendamentosService {
  async execute({ data, mes, ano, fisioterapeuta_id }: IRequest) {
    const agendamentoRepo = AppDataSource.getRepository(Agendamento);

    let dataInicio: string;
    let dataFim: string;

    if (mes && ano) {
      [dataInicio, dataFim] = getAppointmentMonthBounds(mes, ano);
    } else if (data) {
      [dataInicio, dataFim] = getAppointmentDayBounds(data);
    } else {
      const hojeLocal = getCurrentAppointmentDateTime().slice(0, 10);
      [dataInicio, dataFim] = getAppointmentDayBounds(hojeLocal);
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
