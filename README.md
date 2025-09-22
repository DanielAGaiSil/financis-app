# financis-app

# App de Controle Financeiro para Estudantes

Um webapp moderno e intuitivo para controle de finanças pessoais, desenvolvido especialmente para estudantes universitários.

## 🚀 Funcionalidades

- **Dashboard Interativo**: Visualização em tempo real dos gastos com gráfico de pizza
- **Controle de Transações**: Adicionar, editar e excluir receitas e despesas
- **Categorização**: Organização automática por categorias (Alimentação, Transporte, Moradia, etc.)
- **Autenticação Segura**: Sistema de login e cadastro com JWT
- **Responsivo**: Interface adaptada para desktop e mobile

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5 + CSS3
- JavaScript (ES6+)
- Tailwind CSS
- Chart.js (para gráficos)
- Material Icons

### Backend
- PHP 7.4+
- MySQL/MariaDB
- JWT para autenticação
- API RESTful

## 📁 Estrutura do Projeto

```
finance-app/
├── frontend/
│   ├── index.html          # Interface principal
│   └── jsfront.js          # Lógica do frontend
├── backend/
│   ├── config.php          # Configurações e conexão DB
│   ├── auth.php            # Sistema de autenticação
│   ├── transactions.php    # API de transações
│   └── .htaccess          # Configuração Apache
├── database/
│   └── schema.sql          # Schema do banco de dados
└── README.md
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Servidor web (Apache/Nginx)
- PHP 7.4 ou superior
- MySQL/MariaDB
- Extensões PHP: PDO, PDO_MySQL

### Passo a Passo

1. **Clone o projeto**
   ```bash
   git clone <url-do-repositorio>
   cd finance-app
   ```

2. **Configure o banco de dados**
   - Crie um banco de dados MySQL chamado `finance_app`
   - Execute o script `database/schema.sql`
   ```sql
   CREATE DATABASE finance_app;
   USE finance_app;
   SOURCE database/schema.sql;
   ```

3. **Configure o backend**
   - Edite `backend/config.php` com suas credenciais do banco
   - Altere a `JWT_SECRET` para uma chave segura

4. **Configure o servidor web**
   - Aponte o DocumentRoot para a pasta `backend/`
   - Certifique-se de que o mod_rewrite está habilitado

5. **Acesse a aplicação**
   - Frontend: `http://localhost/frontend/`
   - API: `http://localhost/api/`

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário

### Transações
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/{id}` - Atualizar transação
- `DELETE /api/transactions/{id}` - Excluir transação

### Dashboard
- `GET /api/dashboard/summary` - Resumo financeiro
- `GET /api/categories` - Listar categorias

## 🎨 Funcionalidades do Frontend

### Dashboard Principal
- Saldo consolidado em destaque
- Gráfico de pizza interativo das despesas por categoria
- Resumo mensal (entradas, saídas, saldo)
- Notificações e insights automáticos

### Gerenciamento de Transações
- Lista paginada de transações
- Filtros por data, categoria e tipo
- Busca por descrição
- Interface intuitiva para adicionar/editar

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT
- Validação de dados no backend
- Proteção contra SQL Injection
- Headers CORS configurados

## 📱 Responsividade

O design foi pensado mobile-first, garantindo uma experiência otimizada em:
- Smartphones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🚀 Próximas Funcionalidades

- [ ] Orçamentos mensais por categoria
- [ ] Relatórios em PDF
- [ ] Metas de economia
- [ ] Notificações push
- [ ] Integração com bancos (Open Banking)
- [ ] Modo escuro/claro
- [ ] Backup automático

## 🤝 Contribuição

Este é um projeto acadêmico, mas contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👥 Equipe

Desenvolvido por estudantes para estudantes 🎓

---

**Nota**: Este projeto foi desenvolvido para fins educacionais como parte de um trabalho de faculdade, focando em simplicidade e funcionalidade para o controle financeiro de estudantes universitários.
