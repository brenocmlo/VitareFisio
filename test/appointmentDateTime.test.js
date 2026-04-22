const test = require("node:test");
const assert = require("node:assert/strict");

const { AppDataSource } = require("../src/data-source");
const { Agendamento } = require("../src/modules/appointments/entities/Agendamento");
const { Paciente } = require("../src/modules/patients/entities/Paciente");
const {
    addMinutesToAppointmentDateTime,
    appointmentDateTimeTransformer,
    formatAppointmentDate,
    formatAppointmentTime,
    getAppointmentDayBounds,
    normalizeAppointmentDateTime,
    toAppointmentDatabaseValue,
} = require("../src/modules/appointments/utils/appointmentDateTime");
const { CreateAgendamentoService } = require("../src/modules/appointments/services/CreateAgendamentoService");
const { ListAgendamentosService } = require("../src/modules/appointments/services/ListAgendamentosService");
const { RescheduleAgendamentoService } = require("../src/modules/appointments/services/RescheduleAgendamentoService");

test("normaliza datetime local sem deslocar o dia da agenda", () => {
    assert.equal(
        normalizeAppointmentDateTime("2026-04-22T08:00:00"),
        "2026-04-22T08:00:00"
    );
    assert.equal(
        toAppointmentDatabaseValue("2026-04-22T08:00:00"),
        "2026-04-22 08:00:00"
    );
    assert.equal(
        appointmentDateTimeTransformer.from("2026-04-22 08:00:00"),
        "2026-04-22T08:00:00"
    );
});

test("converte ISO com timezone para o horario local da clinica", () => {
    assert.equal(
        normalizeAppointmentDateTime("2026-04-22T11:00:00.000Z"),
        "2026-04-22T08:00:00"
    );
});

test("gera limites do dia sem usar Date UTC que desloca a agenda", () => {
    assert.deepEqual(getAppointmentDayBounds("2026-04-22"), [
        "2026-04-22T00:00:00",
        "2026-04-22T23:59:59",
    ]);
});

test("soma minutos no horario local mesmo virando o dia", () => {
    assert.equal(
        addMinutesToAppointmentDateTime("2026-04-22T23:30:00", 60),
        "2026-04-23T00:30:00"
    );
});

test("formata data e hora de agendamento sem depender do timezone do runtime", () => {
    assert.equal(formatAppointmentDate("2026-04-22T08:00:00"), "22/04/2026");
    assert.equal(formatAppointmentTime("2026-04-22T08:00:00"), "08:00");
});

test("CreateAgendamentoService salva data_hora e data_hora_fim como horario local", async () => {
    const originalGetRepository = AppDataSource.getRepository;
    let capturedConflictWhere;
    let capturedCreatePayload;

    const agendamentoRepository = {
        findOne: async ({ where }) => {
            capturedConflictWhere = where;
            return null;
        },
        create: (payload) => {
            capturedCreatePayload = payload;
            return payload;
        },
        save: async (payload) => payload,
    };

    const pacienteRepository = {
        findOneBy: async () => ({ id: 1, nome: "Paciente Teste" }),
    };

    AppDataSource.getRepository = (entity) => {
        if (entity === Agendamento) {
            return agendamentoRepository;
        }

        if (entity === Paciente) {
            return pacienteRepository;
        }

        throw new Error("Repositorio nao esperado no teste");
    };

    try {
        const service = new CreateAgendamentoService();
        const agendamento = await service.execute({
            paciente_id: 1,
            clinica_id: 1,
            fisioterapeuta_id: 7,
            data_hora: "2026-04-22T08:00:00",
            observacoes: "Teste",
        });

        assert.equal(capturedConflictWhere.data_hora, "2026-04-22T08:00:00");
        assert.equal(capturedCreatePayload.data_hora, "2026-04-22T08:00:00");
        assert.equal(capturedCreatePayload.data_hora_fim, "2026-04-22T09:00:00");
        assert.equal(agendamento.data_hora, "2026-04-22T08:00:00");
    } finally {
        AppDataSource.getRepository = originalGetRepository;
    }
});

test("ListAgendamentosService filtra a agenda pelo mesmo dia local enviado na query", async () => {
    const originalGetRepository = AppDataSource.getRepository;
    let capturedFindOptions;

    const agendamentoRepository = {
        find: async (options) => {
            capturedFindOptions = options;
            return [];
        },
    };

    AppDataSource.getRepository = (entity) => {
        if (entity === Agendamento) {
            return agendamentoRepository;
        }

        throw new Error("Repositorio nao esperado no teste");
    };

    try {
        const service = new ListAgendamentosService();
        await service.execute({
            data: "2026-04-22",
            fisioterapeuta_id: 7,
        });

        assert.equal(capturedFindOptions.where.fisioterapeuta_id, 7);
        assert.deepEqual(capturedFindOptions.where.data_hora.value, [
            "2026-04-22T00:00:00",
            "2026-04-22T23:59:59",
        ]);
    } finally {
        AppDataSource.getRepository = originalGetRepository;
    }
});

test("RescheduleAgendamentoService mantem o reagendamento no mesmo dia local", async () => {
    const originalGetRepository = AppDataSource.getRepository;
    let capturedConflictWhere;
    let capturedSavedAgendamento;

    const agendamentoExistente = {
        id: 99,
        fisioterapeuta_id: 7,
        data_hora: "2026-04-22T08:00:00",
        data_hora_fim: "2026-04-22T09:00:00",
        status: "agendado",
    };

    const agendamentoRepository = {
        findOneBy: async () => agendamentoExistente,
        findOne: async ({ where }) => {
            capturedConflictWhere = where;
            return null;
        },
        save: async (payload) => {
            capturedSavedAgendamento = payload;
            return payload;
        },
    };

    AppDataSource.getRepository = (entity) => {
        if (entity === Agendamento) {
            return agendamentoRepository;
        }

        throw new Error("Repositorio nao esperado no teste");
    };

    try {
        const service = new RescheduleAgendamentoService();
        const agendamento = await service.execute({
            agendamento_id: 99,
            nova_data_hora: "2026-04-22T08:00:00",
        });

        assert.deepEqual(capturedConflictWhere.data_hora.value, [
            "2026-04-22T07:01:00",
            "2026-04-22T08:59:00",
        ]);
        assert.equal(capturedSavedAgendamento.data_hora, "2026-04-22T08:00:00");
        assert.equal(capturedSavedAgendamento.data_hora_fim, "2026-04-22T09:00:00");
        assert.equal(agendamento.data_hora, "2026-04-22T08:00:00");
    } finally {
        AppDataSource.getRepository = originalGetRepository;
    }
});
