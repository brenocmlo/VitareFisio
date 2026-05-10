import { AppDataSource } from "../src/data-source";

async function run() {
    await AppDataSource.initialize();
    
    console.log("Migrando pacientes órfãos para seus donos (Admins)...");
    
    // Update each patient's usuario_id with the ID of the admin of their clinic
    await AppDataSource.query(`
        UPDATE pacientes p
        SET usuario_id = u.id
        FROM usuarios u
        WHERE p.clinica_id = u.clinica_id 
          AND u.tipo = 'admin'
          AND p.usuario_id IS NULL;
    `);

    console.log("Migração concluída com sucesso!");
    process.exit(0);
}

run().catch(console.error);
