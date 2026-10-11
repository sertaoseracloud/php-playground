export class TempoEsgotado extends Error {}

/**
 * Cliente do worker PHP. Executa uma requisição por vez; se uma execução passar
 * do limite (ex.: laço infinito), o worker é descartado e um novo é iniciado.
 */
export class MotorPHP {
  constructor({ aoMudarEstado = () => {}, limiteMs = 8000 } = {}) {
    this.aoMudarEstado = aoMudarEstado;
    this.limiteMs = limiteMs;
    this.fila = Promise.resolve();
    this.proximoId = 1;
    this.iniciar();
  }

  iniciar() {
    this.worker?.terminate();
    this.pendentes = new Map();
    this.aoMudarEstado('carregando');
    this.worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
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
  }

  executar(arquivos, req = {}) {
    const tarefa = this.fila.then(() => this.#rodar(arquivos, req));
    this.fila = tarefa.catch(() => {});
    return tarefa;
  }

  async #rodar(arquivos, req) {
    await this.pronto;
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
        resolve({ ...resposta, ms: Math.round(performance.now() - inicio) });
      });
      this.worker.postMessage({ id, arquivos, req });
    });
  }
}
