import { ValueTransformer } from "typeorm";

const CLINIC_TIME_ZONE = process.env.APP_TIMEZONE || "America/Sao_Paulo";
const LOCAL_DATE_TIME_REGEX =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/;
const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

interface IDateParts {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

function pad(value: number): string {
    return value.toString().padStart(2, "0");
}

function buildLocalDateTimeString(
    { year, month, day, hour, minute, second }: IDateParts,
    separator: "T" | " " = "T"
): string {
    return `${year}-${pad(month)}-${pad(day)}${separator}${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function extractDatePartsFromUtcDate(date: Date): IDateParts {
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds(),
    };
}

function parseDateParts(value: string): IDateParts | null {
    const match = value.trim().match(LOCAL_DATE_TIME_REGEX);

    if (!match) {
        return null;
    }

    const [, year, month, day, hour, minute, second = "0"] = match;
    const parsedDate = new Date(
        Date.UTC(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second),
            0
        )
    );

    const parts = extractDatePartsFromUtcDate(parsedDate);

    if (
        parts.year !== Number(year) ||
        parts.month !== Number(month) ||
        parts.day !== Number(day) ||
        parts.hour !== Number(hour) ||
        parts.minute !== Number(minute) ||
        parts.second !== Number(second)
    ) {
        throw new Error("Formato de data inválido para o agendamento.");
    }

    return parts;
}

function formatDateInClinicTimeZone(date: Date): string {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: CLINIC_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((part) => part.type === type)?.value || "";

    return `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

function ensureDateOnly(value: string): { year: number; month: number; day: number } {
    const match = value.trim().match(DATE_ONLY_REGEX);

    if (!match) {
        throw new Error("Formato de data inválido. Use YYYY-MM-DD.");
    }

    const [, year, month, day] = match;
    const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

    if (
        parsedDate.getUTCFullYear() !== Number(year) ||
        parsedDate.getUTCMonth() + 1 !== Number(month) ||
        parsedDate.getUTCDate() !== Number(day)
    ) {
        throw new Error("Formato de data inválido. Use YYYY-MM-DD.");
    }

    return {
        year: Number(year),
        month: Number(month),
        day: Number(day),
    };
}

export function normalizeAppointmentDateTime(value: string | Date): string {
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            throw new Error("Formato de data inválido para o agendamento.");
        }

        return formatDateInClinicTimeZone(value);
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
        throw new Error("A data e hora do agendamento são obrigatórias.");
    }

    const localParts = parseDateParts(normalizedValue);

    if (localParts) {
        return buildLocalDateTimeString(localParts);
    }

    const parsedDate = new Date(normalizedValue);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Formato de data inválido para o agendamento.");
    }

    return formatDateInClinicTimeZone(parsedDate);
}

export function toAppointmentDatabaseValue(value: string | Date): string {
    return normalizeAppointmentDateTime(value).replace("T", " ");
}

export function fromAppointmentDatabaseValue(value: string | Date | null): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "string") {
        return normalizeAppointmentDateTime(value);
    }

    return normalizeAppointmentDateTime(value);
}

export function addMinutesToAppointmentDateTime(value: string, minutes: number): string {
    const normalizedValue = normalizeAppointmentDateTime(value);
    const parts = parseDateParts(normalizedValue);

    if (!parts) {
        throw new Error("Formato de data inválido para o agendamento.");
    }

    const parsedDate = new Date(
        Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    );

    parsedDate.setUTCMinutes(parsedDate.getUTCMinutes() + minutes);

    return buildLocalDateTimeString(extractDatePartsFromUtcDate(parsedDate));
}

export function getAppointmentDayBounds(value: string): [string, string] {
    const { year, month, day } = ensureDateOnly(value);
    const baseDate = `${year}-${pad(month)}-${pad(day)}`;

    return [`${baseDate}T00:00:00`, `${baseDate}T23:59:59`];
}

export function getAppointmentMonthBounds(mes: string, ano: string): [string, string] {
    const year = Number(ano);
    const month = Number(mes);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        throw new Error("Mês ou ano inválidos para o filtro da agenda.");
    }

    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const monthString = pad(month);

    return [
        `${year}-${monthString}-01T00:00:00`,
        `${year}-${monthString}-${pad(lastDay)}T23:59:59`,
    ];
}

export function getCurrentAppointmentDateTime(): string {
    return formatDateInClinicTimeZone(new Date());
}

export function formatAppointmentDate(value: string, locale = "pt-BR"): string {
    const normalizedValue = normalizeAppointmentDateTime(value);
    const parts = parseDateParts(normalizedValue);

    if (!parts) {
        throw new Error("Formato de data inválido para o agendamento.");
    }

    const parsedDate = new Date(
        Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    );

    return new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(parsedDate);
}

export function formatAppointmentTime(value: string, locale = "pt-BR"): string {
    const normalizedValue = normalizeAppointmentDateTime(value);
    const parts = parseDateParts(normalizedValue);

    if (!parts) {
        throw new Error("Formato de data inválido para o agendamento.");
    }

    const parsedDate = new Date(
        Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    );

    return new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(parsedDate);
}

export const appointmentDateTimeTransformer: ValueTransformer = {
    to: (value: string | Date | null) =>
        value === null || value === undefined ? value : toAppointmentDatabaseValue(value),
    from: (value: string | Date | null) => fromAppointmentDatabaseValue(value),
};
