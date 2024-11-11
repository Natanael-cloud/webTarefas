// Seleção de elementos do DOM
const botaoAdicionarTarefa = document.getElementById("botao-adicionar-tarefa");
const entradaTituloTarefa = document.getElementById("titulo-tarefa");
const entradaCategoriaTarefa = document.getElementById("categoria-tarefa");
const entradaPrazoTarefa = document.getElementById("prazo-tarefa");
const barraDeBusca = document.getElementById("barra-de-busca");
const listasDeTarefas = document.querySelectorAll(".lista-tarefas");

// Função para salvar tarefas no Local Storage
function salvarTarefas() {
    const tarefas = [];
    document.querySelectorAll(".lista-tarefas li").forEach(tarefa => {
        tarefas.push({
            titulo: tarefa.dataset.titulo,
            categoria: tarefa.dataset.categoria,
            prazo: tarefa.dataset.prazo,
            status: tarefa.dataset.status
        });
    });
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Função para carregar tarefas do Local Storage
function carregarTarefas() {
    const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
    tarefas.forEach(tarefa => {
        criarElementoTarefa(tarefa.titulo, tarefa.categoria, tarefa.prazo, tarefa.status);
    });
}

// Função para adicionar tarefa
function adicionarTarefa() {
    const titulo = entradaTituloTarefa.value;
    const categoria = entradaCategoriaTarefa.value;
    const prazo = entradaPrazoTarefa.value;

    if (!titulo || !categoria || !prazo) {
        alert("Por favor, preencha o título, categoria e prazo da tarefa.");
        return;
    }

    criarElementoTarefa(titulo, categoria, prazo, "para-fazer");
    salvarTarefas();

    entradaTituloTarefa.value = "";
    entradaCategoriaTarefa.value = "";
    entradaPrazoTarefa.value = "";
}

// Função para criar o elemento de tarefa no DOM
function criarElementoTarefa(titulo, categoria, prazo, status) {
    const itemTarefa = document.createElement("li");
    itemTarefa.textContent = `${titulo} - ${categoria} - Prazo: ${prazo}`;
    itemTarefa.dataset.titulo = titulo;
    itemTarefa.dataset.categoria = categoria;
    itemTarefa.dataset.prazo = prazo;
    itemTarefa.dataset.status = status;
    itemTarefa.draggable = true;
    itemTarefa.id = `${titulo}-${categoria}-${Date.now()}`;

    const colunaAlvo = document.getElementById(status).querySelector(".lista-tarefas");
    colunaAlvo.appendChild(itemTarefa);

    // Adicionar eventos de arrastar
    itemTarefa.addEventListener("dragstart", iniciarArrastar);
    destacarTarefasComPrazo();
}

// Destacar tarefas próximas ao prazo
function destacarTarefasComPrazo() {
    const hoje = new Date().toISOString().split("T")[0];
    document.querySelectorAll(".lista-tarefas li").forEach(tarefa => {
        const prazo = tarefa.dataset.prazo;
        if (prazo && prazo <= hoje) {
            tarefa.classList.add("destaque");
        }
    });
}

// Função de busca
barraDeBusca.addEventListener("input", () => {
    const textoBusca = barraDeBusca.value.toLowerCase();
    document.querySelectorAll(".lista-tarefas li").forEach(tarefa => {
        const titulo = tarefa.dataset.titulo.toLowerCase();
        const categoria = tarefa.dataset.categoria.toLowerCase();
        tarefa.style.display = titulo.includes(textoBusca) || categoria.includes(textoBusca) ? "" : "none";
    });
});

// Funções de Drag and Drop
function iniciarArrastar(evento) {
    evento.dataTransfer.setData("text/plain", evento.target.id);
}

listasDeTarefas.forEach(lista => {
    lista.addEventListener("dragover", evento => evento.preventDefault());
    lista.addEventListener("drop", evento => {
        const idTarefa = evento.dataTransfer.getData("text");
        const tarefa = document.getElementById(idTarefa);
        if (tarefa) lista.appendChild(tarefa);

        // Atualizar status
        tarefa.dataset.status = lista.parentElement.id;
        salvarTarefas();
    });
});

// Evento para adicionar tarefa
botaoAdicionarTarefa.addEventListener("click", adicionarTarefa);

// Carregar tarefas ao iniciar
carregarTarefas();
destacarTarefasComPrazo();
