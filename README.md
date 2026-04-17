#  VitareFisio API - CRM para Fisioterapia

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)

O **VitareFisio** é um sistema de Gestão de Relacionamento com o Cliente (CRM) e Prontuário Eletrônico de Pacientes (PEP) desenvolvido especificamente para a área de fisioterapia. 

A API foi projetada com uma arquitetura **Multi-tenant**, permitindo atender simultaneamente clínicas com múltiplos profissionais e fisioterapeutas autônomos em ambientes de dados totalmente isolados (Workspaces).

##  Principais Funcionalidades

- **Arquitetura Multi-Tenant:** Isolamento de dados através de `clinica_id`. Fisioterapeutas autônomos recebem uma "clínica virtual" automática no cadastro, garantindo a mesma escalabilidade de grandes clínicas.
- **Gestão de Pacientes & Anexos:** Cadastro completo com upload de documentos (exames, laudos) via Multer.
- **Agenda Inteligente:** Prevenção de choque de horários, cálculo automático de duração de sessões e geração de links dinâmicos para envio de lembretes via WhatsApp. Cancelamentos utilizam *Soft Delete* para manter histórico.
- **Prontuário Eletrônico (Evoluções):** Registros clínicos com validação jurídica (Hash SHA-256) e trava de segurança de edição (máx. 24h), garantindo a imutabilidade após a finalização.
- **Módulo Financeiro:** Controle de faturamento por sessão, registro de pagamentos (PIX, Cartão, Dinheiro) atrelados a clínicas específicas.
- **Dashboard Gerencial:** Rota otimizada para consolidar KPIs em tempo real (Pacientes ativos, Faturamento do mês, Taxa de No-Show/Faltas e Agenda do dia).

## Tecnologias Utilizadas

- **Linguagem:** TypeScript / Node.js
- **Framework:** Express.js
- **Banco de Dados:** MySQL
- **ORM:** TypeORM
- **Validação de Dados:** Zod (Middlewares customizados)
- **Autenticação:** JSON Web Token (JWT) e BcryptJS
- **Upload de Arquivos:** Multer

## 📂 Estrutura do Projeto

O projeto segue uma arquitetura modular inspirada em DDD (Domain-Driven Design), separando responsabilidades por contexto:

```
src/
├── config/             # Configurações globais (Upload, Auth)
├── database/           # Migrations e instanciamento do TypeORM
├── modules/            # Módulos de domínio
│   ├── appointments/   # Agenda, Evoluções, Lembretes
│   ├── clinics/        # Clínicas, Fisioterapeutas, Dashboard, Relatórios
│   ├── finance/        # Pagamentos e Faturamento
│   ├── patients/       # Pacientes e Anexos (Uploads)
│   └── users/          # Usuários e Autenticação (Sessões)
├── shared/             # Recursos compartilhados
│   └── middlewares/    # ensureAuthenticated, validateRequest
└── routes.ts           # Roteamento centralizado da API
```
### Como Executar o Projeto
Pré-requisitos

Node.js (v18+ recomendado)

Banco de Dados MySQL rodando localmente ou em container (Docker)

Passo a Passo

Clone o repositório:

Bash
```
git clone [https://github.com/seu-usuario/vitarefisio-api.git](https://github.com/seu-usuario/vitarefisio-api.git)
cd vitarefisio-api
```
Instale as dependências:

Bash
```
npm install
Configure as Variáveis de Ambiente:
Crie um arquivo .env na raiz do projeto com base no .env.example:
```

Snippet de código
```
DB_HOST=localhost

DB_PORT=3306

DB_USER=root

DB_PASS=sua_senha

DB_NAME=vitarefisio

JWT_SECRET=sua_chave_secreta_super_segura
```
Inicie o Banco de Dados:
Certifique-se de que o schema vitarefisio existe no seu MySQL. O TypeORM (synchronize: true no ambiente de dev) criará as tabelas automaticamente.

Execute a API (Modo de Desenvolvimento):

Bash
```
npm run dev
A API estará rodando em http://localhost:3333 (ou na porta configurada).
```
🛣️ Principais Rotas da API


| Método | Rota | Descrição | Acesso |
|:---|:---|:---|:---|
| POST | `/signup/autonomo` | Cria Usuário, Clínica Virtual e Fisio (Transação) | Público |
| POST | `/login` | Autentica e gera token JWT | Público |
| GET | `/dashboard` | Retorna métricas, agenda e faturamento | Autenticado |
| POST | `/pacientes` | Cadastra um novo paciente | Autenticado |
| POST | `/agendamentos` | Agenda uma nova sessão de fisioterapia | Autenticado |
| PATCH | `/evolucoes/:id/finalizar` | Finaliza e trava o prontuário eletrônico | Autenticado |
| POST | `/pagamentos` | Registra o pagamento de uma sessão | Autenticado |

🛡️ Segurança
Senhas criptografadas no banco de dados com BcryptJS.

Rotas protegidas por Middlewares de Autenticação via token JWT.

Validação rigorosa do payload de entrada (Req.Body, Params e Query) utilizando Zod, prevenindo injeções e erros de tipo antes de atingirem o Controller.
