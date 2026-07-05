-- =========================
-- EMPRESA
-- =========================
CREATE TABLE empresa (
    id_empresa SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(300) NOT NULL,
    email VARCHAR(300) NOT NULL,
    n_telefone VARCHAR(50),
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    senha_hash VARCHAR(300) NOT NULL
);

-- =========================
-- FUNCIONÁRIO (USUÁRIO)
-- =========================
CREATE TABLE funcionario_usuario (
    id_funcionario SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(300) NOT NULL,
    email VARCHAR(300) NOT NULL,
    senha_hash VARCHAR(300) NOT NULL,
    permissoes VARCHAR(300),
    id_empresa INT NOT NULL,
    FOREIGN KEY (id_empresa)
        REFERENCES empresa(id_empresa)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- PROJETO
-- =========================
CREATE TABLE projeto (
    id_projeto SERIAL PRIMARY KEY,
    nome_projeto VARCHAR(300) NOT NULL,
    descricao_projeto TEXT,
    data_inicio DATE,
    data_fim DATE,
    status_projeto VARCHAR(100),
    orcamento_total NUMERIC(12,2),
    id_empresa INT NOT NULL,
    FOREIGN KEY (id_empresa)
        REFERENCES empresa(id_empresa)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- RELAÇÃO FUNCIONÁRIO x PROJETO
-- =========================
CREATE TABLE usuario_projeto (
    id_funcionario INT NOT NULL,
    id_projeto INT NOT NULL,
    PRIMARY KEY (id_funcionario, id_projeto),
    FOREIGN KEY (id_funcionario)
        REFERENCES funcionario_usuario(id_funcionario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_projeto)
        REFERENCES projeto(id_projeto)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- RECURSO
-- =========================
CREATE TABLE recurso (
    id_recurso SERIAL PRIMARY KEY,
    nome VARCHAR(300) NOT NULL,
    tipo VARCHAR(100),
    quantidade INT,
    custo_unitario NUMERIC(10,2)
);

-- =========================
-- PROJETO x RECURSO
-- =========================
CREATE TABLE projeto_recurso (
    id_projeto INT NOT NULL,
    id_recurso INT NOT NULL,
    quantidade_projeto INT,
    PRIMARY KEY (id_projeto, id_recurso),
    FOREIGN KEY (id_projeto)
        REFERENCES projeto(id_projeto)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_recurso)
        REFERENCES recurso(id_recurso)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- CUSTO
-- =========================
CREATE TABLE custo (
    id_custo SERIAL PRIMARY KEY,
    descricao TEXT,
    valor NUMERIC(12,2),
    data_registro DATE,
    id_projeto INT NOT NULL,
    FOREIGN KEY (id_projeto)
        REFERENCES projeto(id_projeto)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- EQUIPE
-- =========================
CREATE TABLE equipe (
    id_equipe SERIAL PRIMARY KEY,
    nome_equipe VARCHAR(300) NOT NULL,
    descricao TEXT
);

-- =========================
-- TRABALHADOR
-- =========================
CREATE TABLE trabalhador (
    id_trabalhador SERIAL PRIMARY KEY,
    nome_trabalhador VARCHAR(300) NOT NULL,
    telefone_trabalhador VARCHAR(50),
    custo_diario NUMERIC(10,2)
);

-- =========================
-- EQUIPE x TRABALHADOR
-- =========================
CREATE TABLE equipe_trabalhador (
    id_equipe INT NOT NULL,
    id_trabalhador INT NOT NULL,
    PRIMARY KEY (id_equipe, id_trabalhador),
    FOREIGN KEY (id_equipe)
        REFERENCES equipe(id_equipe)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_trabalhador)
        REFERENCES trabalhador(id_trabalhador)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =========================
-- MÃO DE OBRA
-- =========================
CREATE TABLE mao_de_obra (
    id_mao_obra SERIAL PRIMARY KEY,
    data_inicio DATE,
    data_fim DATE
);

-- =========================
-- MÃO DE OBRA x EQUIPE
-- =========================
CREATE TABLE mao_obra_equipe (
    id_mao_obra INT NOT NULL,
    id_equipe INT NOT NULL,
    PRIMARY KEY (id_mao_obra, id_equipe),
    FOREIGN KEY (id_mao_obra)
        REFERENCES mao_de_obra(id_mao_obra)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_equipe)
        REFERENCES equipe(id_equipe)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- PROJETO x MÃO DE OBRA
-- =========================
CREATE TABLE projeto_mao_obra (
    id_projeto INT NOT NULL,
    id_mao_obra INT NOT NULL,
    PRIMARY KEY (id_projeto, id_mao_obra),
    FOREIGN KEY (id_projeto)
        REFERENCES projeto(id_projeto)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_mao_obra)
        REFERENCES mao_de_obra(id_mao_obra)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);