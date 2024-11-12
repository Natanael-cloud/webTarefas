// Seletores de Elementos HTML
const listaTarefas = document.getElementById("lista-tarefas");
const listaTarefasAndamento = document.getElementById("lista-tarefas-andamento");
const listaTarefasFeitas = document.getElementById("lista-tarefas-feitas");
const entradaTituloTarefa = document.getElementById("titulo-tarefa");
const entradaCategoriaTarefa = document.getElementById("categoria-tarefa");
const entradaPrazoTarefa = document.getElementById("prazo-tarefa");
const botaoAdicionar = document.getElementById("botao-adicionar-tarefa");
const notificacao = document.getElementById("notificacao");
const alarmeSom = document.getElementById("alarme-som"); // Alarme sonoro

// Função para mostrar notificações
function mostrarNotificacao(mensagem) {
    notificacao.textContent = mensagem;
    notificacao.classList.add("show");
    setTimeout(() => {
        notificacao.classList.remove("show");
    }, 2000);
}

// Função para salvar tarefas no LocalStorage
function salvarTarefas() {
    const tarefas = {
        paraFazer: Array.from(listaTarefas.children).map(tarefaToData),
        emAndamento: Array.from(listaTarefasAndamento.children).map(tarefaToData),
        feitas: Array.from(listaTarefasFeitas.children).map(tarefaToData)
    };
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Função para carregar tarefas do LocalStorage
function carregarTarefas() {
    const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    if (!tarefasSalvas) return;

    tarefasSalvas.paraFazer.forEach(dadosTarefa => {
        const tarefa = criarTarefaElemento(dadosTarefa.titulo, dadosTarefa.categoria, dadosTarefa.prazo, listaTarefas, dadosTarefa.observacao);
        listaTarefas.appendChild(tarefa);
    });
    tarefasSalvas.emAndamento.forEach(dadosTarefa => {
        const tarefa = criarTarefaElemento(dadosTarefa.titulo, dadosTarefa.categoria, dadosTarefa.prazo, listaTarefasAndamento, dadosTarefa.observacao);
        listaTarefasAndamento.appendChild(tarefa);
    });
    tarefasSalvas.feitas.forEach(dadosTarefa => {
        const tarefa = criarTarefaElemento(dadosTarefa.titulo, dadosTarefa.categoria, dadosTarefa.prazo, listaTarefasFeitas, dadosTarefa.observacao);
        listaTarefasFeitas.appendChild(tarefa);
    });
}

// Função para converter elemento de tarefa em dados para salvar
function tarefaToData(tarefa) {
    return {
        titulo: tarefa.dataset.titulo,
        categoria: tarefa.dataset.categoria,
        prazo: tarefa.dataset.prazo,
        observacao: tarefa.dataset.observacao || ""
    };
}

// Função para adicionar uma nova tarefa
function adicionarTarefa() {
    const titulo = entradaTituloTarefa.value.trim();
    const categoria = entradaCategoriaTarefa.value.trim();
    const prazo = entradaPrazoTarefa.value;

    if (!titulo || !categoria || !prazo) {
        mostrarNotificacao("Preencha título, categoria e prazo.");
        return;
    }

    const itemTarefa = criarTarefaElemento(titulo, categoria, prazo, listaTarefas);
    listaTarefas.appendChild(itemTarefa);

    entradaTituloTarefa.value = "";
    entradaCategoriaTarefa.value = "";
    entradaPrazoTarefa.value = "";

    salvarTarefas();
    mostrarNotificacao("Tarefa adicionada!");
}

// Função para criar um elemento de tarefa
function criarTarefaElemento(titulo, categoria, prazo, listaDestino, observacao = "") {
    const itemTarefa = document.createElement("li");
    itemTarefa.classList.add("tarefa-item");
    itemTarefa.innerHTML = `
        <span class="tarefa-texto">${titulo} - ${categoria} - Prazo: ${new Date(prazo).toLocaleString("pt-BR")}</span>
        <button class="botao-observacao">Observações</button>
        <button class="botao-excluir">Excluir</button>
        <div class="observacao-container hidden">
            <textarea class="observacoes" placeholder="Escreva observações...">${observacao}</textarea>
            <button class="botao-salvar-observacao">Salvar Observação</button>
            <button class="botao-fechar-observacao">Fechar Observação</button>
        </div>
    `;

    itemTarefa.dataset.titulo = titulo;
    itemTarefa.dataset.categoria = categoria;
    itemTarefa.dataset.prazo = prazo;
    itemTarefa.dataset.observacao = observacao;

    // Adicionar eventos para mover a tarefa
    const botaoMoverAndamento = document.createElement("button");
    botaoMoverAndamento.textContent = "Mover para Andamento";
    botaoMoverAndamento.addEventListener("click", () => moverPara(listaTarefasAndamento, itemTarefa, "Em Andamento"));

    const botaoMoverFeito = document.createElement("button");
    botaoMoverFeito.textContent = "Mover para Feito";
    botaoMoverFeito.addEventListener("click", () => moverPara(listaTarefasFeitas, itemTarefa, "Feitas"));

    itemTarefa.appendChild(botaoMoverAndamento);
    itemTarefa.appendChild(botaoMoverFeito);

    // Adicionar evento de alarme para o prazo da tarefa
    setAlarmeVisual(itemTarefa, prazo);

    // Adicionar eventos para os botões de observação e exclusão
    itemTarefa.querySelector(".botao-observacao").addEventListener("click", () => toggleObservacao(itemTarefa));
    itemTarefa.querySelector(".botao-salvar-observacao").addEventListener("click", () => salvarObservacao(itemTarefa));
    itemTarefa.querySelector(".botao-fechar-observacao").addEventListener("click", () => fecharObservacao(itemTarefa));
    itemTarefa.querySelector(".botao-excluir").addEventListener("click", () => excluirTarefa(itemTarefa));

    listaDestino.appendChild(itemTarefa);
    return itemTarefa;
}

// Função para alternar a visibilidade do painel de observações
function toggleObservacao(tarefa) {
    const observacaoContainer = tarefa.querySelector(".observacao-container");
    observacaoContainer.classList.toggle("hidden");
}

// Função para salvar observações na tarefa
function salvarObservacao(tarefa) {
    const observacaoTexto = tarefa.querySelector(".observacoes").value;
    tarefa.dataset.observacao = observacaoTexto;
    salvarTarefas();
    mostrarNotificacao("Observação salva!");
}

// Função para fechar a observação
function fecharObservacao(tarefa) {
    tarefa.querySelector(".observacao-container").classList.add("hidden");
}

// Função para excluir uma tarefa, parando alarme visual e sonoro
function excluirTarefa(tarefa) {
    pararAlarme(tarefa);
    tarefa.remove();
    salvarTarefas();
    mostrarNotificacao("Tarefa excluída.");
}

// Função para ativar um alarme visual e sonoro quando o prazo é atingido
function setAlarmeVisual(tarefa, prazo) {
    const prazoData = new Date(prazo).getTime();

    const verificarPrazo = setInterval(() => {
        const agora = new Date().getTime();
        if (agora >= prazoData) {
            tarefa.classList.add("alarme");
            alarmeSom.play(); // Reproduz o som do alarme
            tarefa.dataset.alarmeAtivo = "true"; // Marca o alarme como ativo
            clearInterval(verificarPrazo);
        }
    }, 1000);
}

// Função para parar alarme visual e sonoro
function pararAlarme(tarefa) {
    if (tarefa.dataset.alarmeAtivo === "true") {
        tarefa.classList.remove("alarme"); // Remove efeito visual
        alarmeSom.pause(); // Pausa o som do alarme
        alarmeSom.currentTime = 0; // Reseta o som
        delete tarefa.dataset.alarmeAtivo; // Remove marca de alarme ativo
    }
}

// Função para mover tarefas entre listas e parar alarme se estiver ativo
function moverPara(listaDestino, tarefa, estado) {
    pararAlarme(tarefa); // Para o alarme ao mover
    listaDestino.appendChild(tarefa);
    salvarTarefas();
    mostrarNotificacao(`Tarefa movida para "${estado}".`);
}

// Evento para adicionar uma nova tarefa ao clicar no botão "Adicionar Tarefa"
botaoAdicionar.addEventListener("click", adicionarTarefa);

// Carregar as tarefas salvas ao iniciar
window.addEventListener("load", carregarTarefas);

// CSS adicional para o alarme estroboscópico e observações ocultas
const css = `
.hidden {
    display: none;
}

.alarme {
    animation: estroboscopico 0.5s infinite;
    border-color: #ff4d4d;
}

@keyframes estroboscopico {
    0%, 100% { background-color: #ff4d4d; }
    50% { background-color: #ffeb3b; }
}
`;

// Adicionar estilos ao documento para o efeito estroboscópico e o painel oculto
const style = document.createElement('style');
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);
