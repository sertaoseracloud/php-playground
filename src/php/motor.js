export class TempoEsgotado extends Error {}

const workerDoSite = () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

/**
 * Cliente do worker PHP. Executa uma tarefa por vez; se uma execução passar
 * do limite (ex.: laço infinito), o worker é descartado e um novo é iniciado.
 */
export class MotorPHP {
  constructor({ aoMudarEstado = () => {}, limiteMs = 8000, criarWorker = workerDoSite } = {}) {
    this.aoMudarEstado = aoMudarEstado;
    this.limiteMs = limiteMs;
    this.criarWorker = criarWorker;
    this.fila = Promise.resolve();
    this.proximoId = 1;
    // O worker só nasce na primeira necessidade (garantir): a landing e a trilha não baixam o PHP.
  }

  /** Abre o worker na primeira chamada; as seguintes devolvem o mesmo carregamento. */
  garantir() {
    if (!this.worker) this.iniciar();
    return this.pronto;
  }

  iniciar() {
    this.worker?.terminate();
    this.pendentes = new Map();
    this.aoMudarEstado('carregando');
    this.worker = this.criarWorker();
    this.pronto = new Promise((resolve, reject) => {
      this.worker.onmessage = ({ data }) => {
        if (data.tipo === 'pronto') {
          this.aoMudarEstado('pronto');
          resolve();
        } else if (data.tipo === 'falha') {
          this.aoMudarEstado('falha', data.erro);
          reject(new Error(data.erro));
        } else if (data.tipo === 'resposta') {
          this.pendentes.get(data.id)?.(data);
          this.pendentes.delete(data.id);
        }
      };
      this.worker.onerror = (e) => {
        this.aoMudarEstado('falha', e.message);
        reject(new Error(e.message));
      };
    });
    // A falha já foi avisada por aoMudarEstado; quem executar depois recebe o erro.
    this.pronto.catch(() => {});
  }

  /** Grava os arquivos, prepara o banco e atende uma requisição HTTP simulada. */
  executar(arquivos, req = {}, banco, opcoes) {
    return this.#enfileirar({ acao: 'executar', arquivos, req, banco, opcoes });
  }

  /** Devolve as tabelas do banco (colunas e linhas) para a aba "Banco". */
  async inspecionar(banco, opcoes) {
    return (await this.#enfileirar({ acao: 'inspecionar', banco, opcoes })).tabelas;
  }

  #enfileirar(mensagem) {
    const tarefa = this.fila.then(() => this.#rodar(mensagem));
    this.fila = tarefa.catch(() => {});
    return tarefa;
  }

  async #rodar(mensagem) {
    await this.garantir();
    const id = this.proximoId++;
    const inicio = performance.now();
    return new Promise((resolve, reject) => {
      const relogio = setTimeout(() => {
        this.pendentes.delete(id);
        this.iniciar();
        reject(new TempoEsgotado(`O PHP passou de ${this.limiteMs / 1000} s e foi interrompido.`));
      }, this.limiteMs);
      this.pendentes.set(id, (resposta) => {
        clearTimeout(relogio);
        if (resposta.erroInterno) reject(new Error(resposta.erroInterno));
        else resolve({ ...resposta, ms: Math.round(performance.now() - inicio) });
      });
      this.worker.postMessage({ id, ...mensagem });
    });
  }
}
