import PDFDocument from "pdfkit";
import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";
import { Paciente } from "../../patients/entities/Paciente";

export class GenerateProntuarioPDFService {
    async execute(paciente_id: number): Promise<Buffer> {
        const evolucaoRepo = AppDataSource.getRepository(Evolucao);
        const pacienteRepo = AppDataSource.getRepository(Paciente);

        const paciente = await pacienteRepo.findOneBy({ id: paciente_id });
        const evolucoes = await evolucaoRepo.find({
            where: { paciente_id },
            order: { data_criacao: "DESC" }
        });

        if (!paciente) throw new Error("Paciente não encontrado.");

        return new Promise((resolve) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: any[] = [];

            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));

            // --- Cabeçalho ---
            doc.fontSize(20).text("VitareFisio - Prontuário Clínico", { align: "center" });
            doc.moveDown();
            doc.fontSize(12).text(`Paciente: ${paciente.nome}`);
            doc.text(`CPF: ${paciente.cpf}`);
            doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`);
            doc.moveDown();
            doc.path("M 50 130 L 550 130").stroke(); // Linha divisória
            doc.moveDown();

            // --- Evoluções ---
            evolucoes.forEach((ev) => {
                const secoes = [
                    { titulo: "Subjetivo", valor: ev.subjetivo },
                    { titulo: "Objetivo", valor: ev.objetivo },
                    { titulo: "Avaliação", valor: ev.avaliacao },
                    { titulo: "Plano", valor: ev.plano },
                    { titulo: "CID-10", valor: ev.cid_10 },
                    { titulo: "Diagnóstico Fisioterapêutico", valor: ev.diagnostico_fisioterapeutico },
                    { titulo: "Objetivos do Tratamento", valor: ev.objetivos_tratamento },
                ].filter((secao) => Boolean(secao.valor));

                doc.fillColor("blue").fontSize(10).text(`Sessão em: ${ev.data_criacao.toLocaleDateString("pt-BR")}`);
                doc.fillColor("black");

                if (secoes.length === 0) {
                    doc.fontSize(12).text("Sem conteúdo clínico registrado.");
                } else {
                    secoes.forEach(({ titulo, valor }) => {
                        doc.fontSize(11).text(`${titulo}: ${valor}`);
                    });
                }
                
                // Selo de Autenticidade
                if (ev.finalizada) {
                    doc.fontSize(8).fillColor("green").text(`Assinado digitalmente em ${ev.data_finalizacao?.toLocaleDateString()} - Hash: ${ev.hash_integridade?.substring(0, 10)}...`);
                }
                
                doc.moveDown();
            });

            doc.end();
        });
    }
}
