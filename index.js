// Seletores de Elementos HTML
const listaTarefas = document.getElementById("lista-tarefas"); // Lista de tarefas "Para Fazer"
const listaTarefasAndamento = document.getElementById("lista-tarefas-andamento"); // Lista de tarefas "Em Andamento"
const listaTarefasFeitas = document.getElementById("lista-tarefas-feitas"); // Lista de tarefas "Feitas"
const entradaTituloTarefa = document.getElementById("titulo-tarefa"); // Campo de entrada para o título da tarefa
const entradaCategoriaTarefa = document.getElementById("categoria-tarefa"); // Campo de entrada para a categoria da tarefa
const entradaPrazoTarefa = document.getElementById("prazo-tarefa"); // Campo de entrada para o prazo da tarefa
const botaoAdicionar = document.getElementById("botao-adicionar-tarefa"); // Botão para adicionar uma nova tarefa
const notificacao = document.getElementById("notificacao"); // Elemento para exibir notificações
const alarmeSom = document.getElementById("alarme-som"); // Elemento de áudio para o som do alarme

// Função para mostrar notificações
function mostrarNotificacao(mensagem) {
    notificacao.textContent = mensagem; // Define o texto da notificação
    notificacao.classList.add("show"); // Mostra a notificação
    setTimeout(() => { // Define um tempo para a notificação desaparecer
        notificacao.classList.remove("show"); // Oculta a notificação após 2 segundos
    }, 2000);
}

// Função para salvar tarefas no LocalStorage
function salvarTarefas() {
    const tarefas = { // Cria um objeto contendo listas de tarefas
        paraFazer: Array.from(listaTarefas.children).map(tarefaToData), // Converte as tarefas "Para Fazer" em dados
        emAndamento: Array.from(listaTarefasAndamento.children).map(tarefaToData), // Converte as tarefas "Em Andamento" em dados
        feitas: Array.from(listaTarefasFeitas.children).map(tarefaToData) // Converte as tarefas "Feitas" em dados
    };
    localStorage.setItem("tarefas", JSON.stringify(tarefas)); // Salva o objeto como uma string JSON no LocalStorage
}

// Função para carregar tarefas do LocalStorage
function carregarTarefas() {
    const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas")); // Obtém e converte as tarefas salvas do LocalStorage
    if (!tarefasSalvas) return; // Retorna se não houver tarefas salvas

    // Adiciona as tarefas "Para Fazer" da memória para a lista
    tarefasSalvas.paraFazer.forEach(dadosTarefa => {
        const tarefa = criarTarefaElemento(dadosTarefa.titulo, dadosTarefa.categoria, dadosTarefa.prazo, listaTarefas, dadosTarefa.observacao); // Cria o elemento
        listaTarefas.appendChild(tarefa); // Adiciona a tarefa à lista "Para Fazer"
    });
    
    // Adiciona as tarefas "Em Andamento" da memória para a lista
    tarefasSalvas.emAndamento.forEach(dadosTarefa => {
        const tarefa = criarTarefaElemento(dadosTarefa.titulo, dadosTarefa.categoria, dadosTarefa.prazo, listaTarefasAndamento, dadosTarefa.observacao); // Cria o elemento
        listaTarefasAndamento.appendChild(tarefa); // Adiciona a tarefa à lista "Em Andamento"
    });

    // Adiciona as tarefas "Feitas" da memória para a lista
    tarefasSalvas.feitas.forEach(dadosTarefa => {
        const tarefa = criarTarefaElemento(dadosTarefa.titulo, dadosTarefa.categoria, dadosTarefa.prazo, listaTarefasFeitas, dadosTarefa.observacao); // Cria o elemento
        listaTarefasFeitas.appendChild(tarefa); // Adiciona a tarefa à lista "Feitas"
    });
}

// Função para converter elemento de tarefa em dados para salvar
function tarefaToData(tarefa) {
    return { // Retorna um objeto com os dados da tarefa
        titulo: tarefa.dataset.titulo, // Título da tarefa
        categoria: tarefa.dataset.categoria, // Categoria da tarefa
        prazo: tarefa.dataset.prazo, // Prazo da tarefa
        observacao: tarefa.dataset.observacao || "" // Observação da tarefa, ou vazio se não houver
    };
}

// Função para adicionar uma nova tarefa
function adicionarTarefa() {
    const titulo = entradaTituloTarefa.value.trim(); // Obtém e limpa espaços do título
    const categoria = entradaCategoriaTarefa.value.trim(); // Obtém e limpa espaços da categoria
    const prazo = entradaPrazoTarefa.value; // Obtém o valor do prazo

    if (!titulo || !categoria || !prazo) { // Verifica se algum campo está vazio
        mostrarNotificacao("Preencha título, categoria e prazo."); // Mostra notificação se faltarem dados
        return;
    }

    const itemTarefa = criarTarefaElemento(titulo, categoria, prazo, listaTarefas); // Cria o elemento de tarefa
    listaTarefas.appendChild(itemTarefa); // Adiciona a tarefa à lista "Para Fazer"

    // Limpa os campos de entrada
    entradaTituloTarefa.value = "";
    entradaCategoriaTarefa.value = "";
    entradaPrazoTarefa.value = "";

    salvarTarefas(); // Salva as tarefas atualizadas no LocalStorage
    mostrarNotificacao("Tarefa adicionada!"); // Mostra notificação de sucesso
}

// Função para criar um elemento de tarefa
function criarTarefaElemento(titulo, categoria, prazo, listaDestino, observacao = "") {
    const itemTarefa = document.createElement("li"); // Cria o elemento da tarefa como lista
    itemTarefa.classList.add("tarefa-item"); // Adiciona classe ao elemento
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

    itemTarefa.dataset.titulo = titulo; // Armazena o título no dataset do elemento
    itemTarefa.dataset.categoria = categoria; // Armazena a categoria no dataset do elemento
    itemTarefa.dataset.prazo = prazo; // Armazena o prazo no dataset do elemento
    itemTarefa.dataset.observacao = observacao; // Armazena a observação no dataset do elemento

    // Adiciona botão para mover para "Em Andamento"
    const botaoMoverAndamento = document.createElement("button"); // Cria o botão
    botaoMoverAndamento.textContent = "Mover para Andamento"; // Texto do botão
    botaoMoverAndamento.addEventListener("click", () => moverPara(listaTarefasAndamento, itemTarefa, "Em Andamento")); // Evento para mover

    // Adiciona botão para mover para "Feito"
    const botaoMoverFeito = document.createElement("button"); // Cria o botão
    botaoMoverFeito.textContent = "Mover para Feito"; // Texto do botão
    botaoMoverFeito.addEventListener("click", () => moverPara(listaTarefasFeitas, itemTarefa, "Feitas")); // Evento para mover

    itemTarefa.appendChild(botaoMoverAndamento); // Adiciona botão de mover para "Em Andamento" à tarefa
    itemTarefa.appendChild(botaoMoverFeito); // Adiciona botão de mover para "Feito" à tarefa

    setAlarmeVisual(itemTarefa, prazo); // Define o alarme visual e sonoro para o prazo da tarefa

    // Eventos para observações e exclusão
    itemTarefa.querySelector(".botao-observacao").addEventListener("click", () => toggleObservacao(itemTarefa)); // Abre painel de observação
    itemTarefa.querySelector(".botao-salvar-observacao").addEventListener("click", () => salvarObservacao(itemTarefa)); // Salva a observação
    itemTarefa.querySelector(".botao-fechar-observacao").addEventListener("click", () => fecharObservacao(itemTarefa)); // Fecha o painel de observação
    itemTarefa.querySelector(".botao-excluir").addEventListener("click", () => excluirTarefa(itemTarefa)); // Exclui a tarefa

    listaDestino.appendChild(itemTarefa); // Adiciona a tarefa ao destino especificado
    return itemTarefa; // Retorna o elemento de tarefa criado
}

// Função para alternar a visibilidade do painel de observações
function toggleObservacao(tarefa) {
    const observacaoContainer = tarefa.querySelector(".observacao-container"); // Seleciona o painel de observações
    observacaoContainer.classList.toggle("hidden"); // Alterna a visibilidade do painel
}

// Função para salvar observações na tarefa
function salvarObservacao(tarefa) {
    const observacaoTexto = tarefa.querySelector(".observacoes").value; // Obtém o texto da observação
    tarefa.dataset.observacao = observacaoTexto; // Salva a observação no dataset
    salvarTarefas(); // Atualiza o LocalStorage
    mostrarNotificacao("Observação salva!"); // Mostra notificação de sucesso
}

// Função para fechar a observação
function fecharObservacao(tarefa) {
    tarefa.querySelector(".observacao-container").classList.add("hidden"); // Oculta o painel de observações
}

// Função para excluir uma tarefa, parando alarme visual e sonoro
function excluirTarefa(tarefa) {
    pararAlarme(tarefa); // Para o alarme visual e sonoro, se ativo
    tarefa.remove(); // Remove o elemento da tarefa
    salvarTarefas(); // Atualiza o LocalStorage
    mostrarNotificacao("Tarefa excluída."); // Notificação de exclusão
}

// Função para ativar um alarme visual e sonoro quando o prazo é atingido
function setAlarmeVisual(tarefa, prazo) {
    const prazoData = new Date(prazo).getTime(); // Converte o prazo para um timestamp

    // Define intervalo para verificar se o prazo foi atingido
    const verificarPrazo = setInterval(() => {
        const agora = new Date().getTime(); // Obtém o timestamp atual
        if (agora >= prazoData) { // Verifica se o prazo foi atingido
            tarefa.classList.add("alarme"); // Ativa o efeito visual
            alarmeSom.play(); // Reproduz o som do alarme
            tarefa.dataset.alarmeAtivo = "true"; // Marca o alarme como ativo

            // Adiciona botão de pausa do alarme
            const botaoPausar = document.createElement("button"); // Cria botão de pausa
            botaoPausar.textContent = "Pausar Alarme"; // Define texto do botão
            botaoPausar.classList.add("botao-pausar-alarme"); // Adiciona uma classe para o botão de pausa
            botaoPausar.addEventListener("click", () => pausarAlarme(tarefa, botaoPausar)); // Adiciona evento de pausa ao botão
            tarefa.appendChild(botaoPausar); // Adiciona o botão à tarefa
            
            clearInterval(verificarPrazo); // Para o loop de verificação
        }
    }, 1000);
}

// Função para pausar o alarme visual e sonoro
function pausarAlarme(tarefa, botaoPausar) {
    pararAlarme(tarefa); // Chama a função pararAlarme para remover o efeito e o som
    botaoPausar.remove(); // Remove o botão de pausa da tarefa
}

// Função para parar alarme visual e sonoro
function pararAlarme(tarefa) {
    if (tarefa.dataset.alarmeAtivo === "true") { // Verifica se o alarme está ativo
        tarefa.classList.remove("alarme"); // Remove o efeito visual
        alarmeSom.pause(); // Pausa o som do alarme
        alarmeSom.currentTime = 0; // Reseta o áudio para o início
        delete tarefa.dataset.alarmeAtivo; // Remove a marcação de alarme ativo
    }
}

// Função para mover tarefas entre listas e parar alarme se estiver ativo
function moverPara(listaDestino, tarefa, estado) {
    pararAlarme(tarefa); // Para o alarme ao mover a tarefa
    listaDestino.appendChild(tarefa); // Move a tarefa para a lista de destino
    salvarTarefas(); // Atualiza o LocalStorage
    mostrarNotificacao(`Tarefa movida para "${estado}".`); // Mostra notificação de sucesso
}

// Evento para adicionar uma nova tarefa ao clicar no botão "Adicionar Tarefa"
botaoAdicionar.addEventListener("click", adicionarTarefa); // Associa a função adicionarTarefa ao botão

// Carregar as tarefas salvas ao iniciar
window.addEventListener("load", carregarTarefas); // Carrega as tarefas do LocalStorage quando a página é carregada

// CSS adicional para o alarme estroboscópico e observações ocultas
const css = `
.hidden {
    display: none;
}

.alarme {
    animation: estroboscopico 0.5s infinite;
    border-color: #ff4d4d;
}

.botao-pausar-alarme {
    margin-left: 10px;
    background-color: #ff4d4d;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
}

.botao-pausar-alarme:hover {
    background-color: #ff3333;
}

@keyframes estroboscopico {
    0%, 100% { background-color: #ff4d4d; }
    50% { background-color: #ffeb3b; }
}
`;

// Adicionar estilos ao documento para o efeito estroboscópico e o painel oculto
const style = document.createElement('style'); // Cria um elemento <style>
style.appendChild(document.createTextNode(css)); // Adiciona o CSS criado ao estilo
document.head.appendChild(style); // Adiciona o <style> ao <head> do documento
