// --- VERSÃO COM DEBUG PARA CELULAR ---

// 1. COLE SUAS CHAVES REAIS AQUI
const SUPABASE_URL = 'https://efqgcfqpkqkrjejtntrk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Fkjlr7NXmet1F-yD9tpS8A_RoCGKh-u';

// Verificação de segurança para te avisar na tela
if (SUPABASE_URL.includes('SUA_URL') || SUPABASE_KEY.length < 10) {
    alert("ERRO: Você esqueceu de colocar as chaves do Supabase no arquivo app.js!");
}

let supabase;
let channel = null;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
    alert("Erro ao iniciar Supabase: " + error.message);
}

// Variáveis globais
let myUser = '';
let myRoom = '';

function entrarNoChat() {
    try {
        myUser = document.getElementById('username').value;
        myRoom = document.getElementById('room').value;

        if (!myUser || !myRoom) return alert("Preencha o nome e a sala!");

        // Troca a tela
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('chat-screen').classList.remove('hidden');
        
        // Atualiza título
        document.getElementById('room-display').innerText = 'Sala: ' + myRoom;

        conectarSupabase();
    } catch (e) {
        alert("Erro no botão entrar: " + e.message);
    }
}

function conectarSupabase() {
    try {
        channel = supabase.channel(myRoom);
        
        channel
            .on('broadcast', { event: 'mensagem' }, (payload) => {
                console.log('Mensagem recebida:', payload); // Debug
                if(payload.payload) {
                    exibirMensagem(payload.payload.user, payload.payload.text);
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    adicionarAviso(`Você entrou na sala "${myRoom}"`);
                }
                if (status === 'CHANNEL_ERROR') {
                    alert("Erro ao conectar na sala. Verifique sua internet ou as chaves.");
                }
            });
    } catch (e) {
        alert("Erro ao conectar: " + e.message);
    }
}

async function enviarMensagem() {
    const input = document.getElementById('msg-input');
    const texto = input.value;
    if (!texto) return;

    try {
        await channel.send({
            type: 'broadcast',
            event: 'mensagem',
            payload: { user: myUser, text: texto }
        });
        
        exibirMensagem('Eu', texto);
        input.value = '';
    } catch (e) {
        alert("Erro ao enviar: " + e.message);
    }
}

function exibirMensagem(usuario, texto) {
    const div = document.createElement('div');
    const souEu = usuario === 'Eu';
    div.className = `msg ${souEu ? 'eu' : 'outro'}`;
    div.innerHTML = `<strong>${souEu ? 'Você' : usuario}</strong>${texto}`;
    const container = document.getElementById('messages');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function adicionarAviso(texto) {
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    div.style.fontSize = '0.8em';
    div.style.color = '#888';
    div.innerText = texto;
    document.getElementById('messages').appendChild(div);
}

function sairDoChat() {
    if (channel) supabase.removeChannel(channel);
    location.reload();
}
