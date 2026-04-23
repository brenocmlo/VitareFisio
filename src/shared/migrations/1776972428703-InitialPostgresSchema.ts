import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialPostgresSchema1776972428703 implements MigrationInterface {
    name = 'InitialPostgresSchema1776972428703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."usuarios_tipo_enum" AS ENUM('admin', 'fisioterapeuta', 'recepcao')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "cpf" character varying NOT NULL, "email" character varying NOT NULL, "senha" character varying NOT NULL, "clinica_id" integer NOT NULL, "tipo" "public"."usuarios_tipo_enum" NOT NULL, "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ebebcaef8457dcff6e6d69f17b0" UNIQUE ("cpf"), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pacientes" ("id" SERIAL NOT NULL, "clinica_id" integer NOT NULL, "nome" character varying NOT NULL, "cpf" character varying NOT NULL, "data_nascimento" date, "contato_whatsapp" character varying, "endereco_completo" text, "valor_sessao" numeric(10,2), "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d6737b831d4e311678dfce056b6" UNIQUE ("cpf"), CONSTRAINT "PK_aa9c9f624ff22fc06c44d8b1609" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "paciente_anexos" ("id" SERIAL NOT NULL, "paciente_id" integer NOT NULL, "clinica_id" integer, "titulo" character varying NOT NULL, "nome_arquivo" character varying NOT NULL, "tipo" character varying, "tipo_mime" character varying, "tamanho_bytes" bigint, "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_636740482e70eaf34f772d1b569" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pacotes_pacientes_status_pagamento_enum" AS ENUM('pendente', 'pago', 'cancelado')`);
        await queryRunner.query(`CREATE TABLE "pacotes_pacientes" ("id" SERIAL NOT NULL, "paciente_id" integer NOT NULL, "clinica_id" integer NOT NULL, "sessoes_total" integer NOT NULL, "sessoes_restantes" integer NOT NULL, "data_validade" date, "status_pagamento" "public"."pacotes_pacientes_status_pagamento_enum" NOT NULL DEFAULT 'pendente', "data_compra" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ac1595f19681e0688efff755012" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "anamneses" ("id" SERIAL NOT NULL, "paciente_id" integer NOT NULL, "queixa_principal" text, "historico_doenca_atual" text, "historico_patologico_pregresso" text, "medicamentos_em_uso" text, "exames_complementares" text, "observacoes" text, "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a5cb24669dd0448b9773732f107" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."agendamentos_status_enum" AS ENUM('agendado', 'confirmado', 'realizado', 'faltou', 'cancelado')`);
        await queryRunner.query(`CREATE TABLE "agendamentos" ("id" SERIAL NOT NULL, "data_hora_inicio" TIMESTAMP NOT NULL, "data_hora_fim" TIMESTAMP NOT NULL, "status" "public"."agendamentos_status_enum" NOT NULL DEFAULT 'agendado', "observacoes" text, "paciente_id" integer NOT NULL, "clinica_id" integer NOT NULL, "fisioterapeuta_id" integer NOT NULL, "pacote_paciente_id" integer, CONSTRAINT "PK_3890b7448ebc7efdfd1d43bf0c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pagamentos" ("id" SERIAL NOT NULL, "paciente_id" integer NOT NULL, "agendamento_id" integer, "clinica_id" integer NOT NULL, "valor" numeric(10,2) NOT NULL, "metodo_pagamento" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pendente', "data_vencimento" date, "data_pagamento" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0127f8bc8386b0e522c7cc5a9fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clinicas" ("id" SERIAL NOT NULL, "nome_fantasia" character varying NOT NULL, "razao_social" character varying, "cnpj" character varying, "telefone" character varying, "endereco" text, "data_criacao" TIMESTAMP NOT NULL, CONSTRAINT "UQ_985619c71634d60628bbca87157" UNIQUE ("cnpj"), CONSTRAINT "PK_3e3bdf302438f0355d70ae52b0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fisioterapeutas_status_enum" AS ENUM('ativo', 'inativo')`);
        await queryRunner.query(`CREATE TABLE "fisioterapeutas" ("id" SERIAL NOT NULL, "clinica_id" integer NOT NULL, "nome" character varying NOT NULL, "crefito" character varying NOT NULL, "especialidade" character varying, "email" character varying, "status" "public"."fisioterapeutas_status_enum" NOT NULL DEFAULT 'ativo', CONSTRAINT "UQ_b5a172f932b7f09c92e9fd2968a" UNIQUE ("crefito"), CONSTRAINT "PK_5df3575eaf1cc11655754b031c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evolucoes" ("id" SERIAL NOT NULL, "agendamento_id" integer NOT NULL, "paciente_id" integer NOT NULL, "subjetivo" text, "objetivo" text, "avaliacao" text, "plano" text, "cid_10" character varying, "diagnostico_fisioterapeutico" text, "objetivos_tratamento" text, "hash_integridade" character varying, "finalizada" boolean NOT NULL DEFAULT false, "data_finalizacao" TIMESTAMP, "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b31a3377fa4ea352a6cd282be10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "paciente_anexos" ADD CONSTRAINT "FK_5b57d8ad43a8e1a0e5270244d73" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pacotes_pacientes" ADD CONSTRAINT "FK_ed0e51674763495325e85bc5df4" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "anamneses" ADD CONSTRAINT "FK_6bd0ad0d88a97920d57a51ad1c5" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agendamentos" ADD CONSTRAINT "FK_6d126dfca43749da338ef17bb64" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agendamentos" ADD CONSTRAINT "FK_aeda06fb3c1d0278baebb064a67" FOREIGN KEY ("pacote_paciente_id") REFERENCES "pacotes_pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pagamentos" ADD CONSTRAINT "FK_942c8634a5c7be41947265f75b2" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pagamentos" ADD CONSTRAINT "FK_317997650c6f33217c672e0f4f2" FOREIGN KEY ("agendamento_id") REFERENCES "agendamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fisioterapeutas" ADD CONSTRAINT "FK_afe64ab3ed4624192c2a01db5be" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evolucoes" ADD CONSTRAINT "FK_daafc11206858d2f5afe9b53936" FOREIGN KEY ("agendamento_id") REFERENCES "agendamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evolucoes" ADD CONSTRAINT "FK_e1078a9cd462db49bcbd7f2862a" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evolucoes" DROP CONSTRAINT "FK_e1078a9cd462db49bcbd7f2862a"`);
        await queryRunner.query(`ALTER TABLE "evolucoes" DROP CONSTRAINT "FK_daafc11206858d2f5afe9b53936"`);
        await queryRunner.query(`ALTER TABLE "fisioterapeutas" DROP CONSTRAINT "FK_afe64ab3ed4624192c2a01db5be"`);
        await queryRunner.query(`ALTER TABLE "pagamentos" DROP CONSTRAINT "FK_317997650c6f33217c672e0f4f2"`);
        await queryRunner.query(`ALTER TABLE "pagamentos" DROP CONSTRAINT "FK_942c8634a5c7be41947265f75b2"`);
        await queryRunner.query(`ALTER TABLE "agendamentos" DROP CONSTRAINT "FK_aeda06fb3c1d0278baebb064a67"`);
        await queryRunner.query(`ALTER TABLE "agendamentos" DROP CONSTRAINT "FK_6d126dfca43749da338ef17bb64"`);
        await queryRunner.query(`ALTER TABLE "anamneses" DROP CONSTRAINT "FK_6bd0ad0d88a97920d57a51ad1c5"`);
        await queryRunner.query(`ALTER TABLE "pacotes_pacientes" DROP CONSTRAINT "FK_ed0e51674763495325e85bc5df4"`);
        await queryRunner.query(`ALTER TABLE "paciente_anexos" DROP CONSTRAINT "FK_5b57d8ad43a8e1a0e5270244d73"`);
        await queryRunner.query(`DROP TABLE "evolucoes"`);
        await queryRunner.query(`DROP TABLE "fisioterapeutas"`);
        await queryRunner.query(`DROP TYPE "public"."fisioterapeutas_status_enum"`);
        await queryRunner.query(`DROP TABLE "clinicas"`);
        await queryRunner.query(`DROP TABLE "pagamentos"`);
        await queryRunner.query(`DROP TABLE "agendamentos"`);
        await queryRunner.query(`DROP TYPE "public"."agendamentos_status_enum"`);
        await queryRunner.query(`DROP TABLE "anamneses"`);
        await queryRunner.query(`DROP TABLE "pacotes_pacientes"`);
        await queryRunner.query(`DROP TYPE "public"."pacotes_pacientes_status_pagamento_enum"`);
        await queryRunner.query(`DROP TABLE "paciente_anexos"`);
        await queryRunner.query(`DROP TABLE "pacientes"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_tipo_enum"`);
    }

}
