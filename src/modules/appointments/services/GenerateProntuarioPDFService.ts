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
                doc.fillColor("blue").fontSize(10).text(`Sessão em: ${ev.data_criacao.toLocaleDateString("pt-BR")}`);
                doc.fillColor("black").fontSize(12).text(`Descrição: ${ev.descricao}`);
                if (ev.cid_10) doc.fontSize(10).text(`CID-10: ${ev.cid_10}`);
                
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