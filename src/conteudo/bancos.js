// Scripts SQL (SQLite) que criam os bancos dos problemas.
// O banco é recriado a cada execução em /banco/escola.sqlite.

export const DSN = 'sqlite:/banco/escola.sqlite';

const ESTRUTURA = `
CREATE TABLE cursos (
  id    INTEGER PRIMARY KEY,
  nome  TEXT NOT NULL,
  turno TEXT NOT NULL
);

CREATE TABLE alunos (
  id       INTEGER PRIMARY KEY,
  nome     TEXT NOT NULL,
  idade    INTEGER NOT NULL,
  nota     REAL NOT NULL,
  curso_id INTEGER REFERENCES cursos(id)
);
`;

/** Banco principal: 4 cursos (Mecânica sem alunos) e 8 alunos. */
export const BANCO_ESCOLA = `${ESTRUTURA}
INSERT INTO cursos (id, nome, turno) VALUES
  (1, 'Informática', 'Manhã'),
  (2, 'Eletrônica',  'Tarde'),
  (3, 'Design',      'Noite'),
  (4, 'Mecânica',    'Noite');

INSERT INTO alunos (nome, idade, nota, curso_id) VALUES
  ('Ana Souza',    17,  9.0, 1),
  ('Bruno Lima',   16,  6.5, 1),
  ('Carla Dias',   18,  8.0, 2),
  ('Diego Alves',  17,  5.0, 2),
  ('Elisa Rocha',  16,  7.0, 3),
  ('Felipe Nunes', 19,  4.5, 1),
  ('Gabi Costa',   17, 10.0, 3),
  ('Hugo Melo',    18,  7.5, 2);
`;

/** Banco alternativo, usado nos casos ocultos para impedir respostas fixas. */
export const BANCO_ALTERNATIVO = `${ESTRUTURA}
INSERT INTO cursos (id, nome, turno) VALUES
  (1, 'Informática', 'Manhã'),
  (2, 'Redes',       'Noite');

INSERT INTO alunos (nome, idade, nota, curso_id) VALUES
  ('Zeca Prado', 20, 7.0, 2),
  ('Yara Melo',  15, 3.0, 1),
  ('Xavier Luz', 17, 8.5, 1);
`;
