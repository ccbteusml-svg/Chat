// CONFIGURAÇÃO DO SUPABASE (COLE SUAS CHAVES AQUI)
const SUPABASE_URL = 'https://efqgcfqpkqkrjejtntrk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Fkjlr7NXmet1F-yD9tpS8A_RoCGKh-u';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let channel = null;
let myUser = '';
let myRoom = '';

// 1. Entrar na Sala
function entrarNoChat() {
    myUser = document.getElementById('username').value;
    myRoom = document.getElementById('room').value;

    if (!myUser || !myRoom) return alert("Preencha tudo!");

    // Troca de tela
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
    document.getElementById('room-display').innerText = `Sala: ${myRoom}`;

    conectarSupabase();
}

// 2. Conexão Realtime (Broadcast)
function conectarSupabase() {
    // Cria um canal baseado no nome da sala
    channel = supabase.channel(myRoom);

    channel
        .on('broadcast', { event: 'mensagem' }, (payload) => {
            // Quando receber algo, mostra na tela
            exibirMensagem(payload.payload.user, payload.payload.text);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                adicionarAviso(`Você entrou na sala "${myRoom}"`);
            }
        });
}

// 3. Enviar Mensagem
async function enviarMensagem() {
    const input = document.getElementById('msg-input');
    const texto = input.value;
    if (!texto) return;

    // Envia para o Supabase (Não salva no banco, só espalha)
    await channel.send({
        type: 'broadcast',
        event: 'mensagem',
        payload: { user: myUser, text: texto }
    });

    // Mostra minha própria mensagem na tela
    exibirMensagem('Eu', texto);
    input.value = '';
}

// 4. Mostrar na tela (DOM)
function exibirMensagem(usuario, texto) {
    const div = document.createElement('div');
    const souEu = usuario === 'Eu';
    
    div.className = `msg ${souEu ? 'eu' : 'outro'}`;
    div.innerHTML = `<strong>${souEu ? 'Você' : usuario}</strong>${texto}`;
    
    const container = document.getElementById('messages');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight; // Rola pra baixo
}

function adicionarAviso(texto) {
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    div.style.fontSize = '0.8em';
    div.style.color = '#888';
    div.innerText = texto;
    document.getElementById('messages').appendChild(div);
}

// 5. Sair e Limpar
function sairDoChat() {
    if (channel) supabase.removeChannel(channel);
    location.reload(); // Recarrega a página para limpar tudo da memória
}
