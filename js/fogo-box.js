

// Autenticação
const supabaseUrl = appConfig.supabaseUrl;
const supabaseKey = appConfig.supabaseKey;
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const subscribeBtn = document.querySelector('.subscribe-btn');
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const closeModal = document.getElementById('close-modal');
const userEmailDisplay = document.getElementById('user-email-display');
const signOutBtn = document.getElementById('sign-out-btn');

// Estado global para guardar se o user é assinante
let isSubscriber = false;

// Função para chamar Edge Functions
async function callEdgeFunction(functionName, body = {}) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { data, error } = await supabaseClient.functions.invoke(functionName, {
        body: body,
        headers: {
            Authorization: `Bearer ${session.access_token}`
        }
    });

    if (error) {
        console.error(`Erro ao chamar ${functionName}:`, error);
        alert('Ocorreu um erro. Tenta novamente.');
    } else if (data && data.url) {
        window.location.href = data.url;
    }
}

// Handler do botão principal
subscribeBtn.addEventListener('click', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        // Se não tem sessão, abre modal de login
        authModal.style.display = 'flex';
        return;
    }

    // Se já tem sessão, decide qual função chamar
    const { data: { session: currentSession } } = await supabaseClient.auth.getSession();
    if (isSubscriber) {
        // Se é assinante -> Portal
        subscribeBtn.disabled = true;
        subscribeBtn.innerHTML = "A ABRIR PORTAL...";
        await callEdgeFunction('portal', { returnUrl: window.location.origin });
        subscribeBtn.disabled = false;
        subscribeBtn.innerHTML = `GERIR SUBSCRIÇÃO<span class="subscribe-btn-email">${currentSession?.user?.email || ''}</span>`;
    } else {
        // Se não é assinante -> Checkout (TEMPORÁRIO: Produto Indisponível)
        window.location.href = "/pages/indisponivel.html";
        
        /* CÓDIGO ORIGINAL (Recuperar mais tarde)
        subscribeBtn.disabled = true;
        subscribeBtn.innerHTML = "A REDIRECIONAR...";
        await callEdgeFunction('checkout'); // Preço hardcoded no backend
        subscribeBtn.disabled = false;
        subscribeBtn.innerHTML = `COMEÇAR A RECEBER<span class="subscribe-btn-email">${currentSession?.user?.email || ''}</span>`;
        */
    }
});

// Fechar modal
closeModal.onclick = () => authModal.style.display = 'none';

// Logout
if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        // UI updates automatically via onAuthStateChange
    });
}

// Lógica Magic Link
authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('auth-message');

    const { error } = await supabaseClient.auth.signInWithOtp({
        email: email,
        options: {
            emailRedirectTo: 'http://127.0.0.1:5500/pages/fogo-box.html'
        }
    });

    if (error) {
        messageDiv.innerText = "Erro: " + error.message;
    } else {
        messageDiv.innerText = "Verifica o teu email para o link de acesso!";
    }
};

// Verificar estado da subscrição na BD
async function checkSubscriptionStatus(user) {
    if (!user) return;

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Erro ao ler profile:', error);
        // Assumimos não assinante em caso de erro, ou tratamos conforme necessário
        return;
    }

    if (data && data.subscription_status === 'active') {
        isSubscriber = true;
    } else {
        isSubscriber = false;
    }
}

const userStatusRow = document.querySelector('.user-status-row');
// Ocultar sempre a user-status-row (email + logout abaixo do botão)
if (userStatusRow) userStatusRow.style.display = 'none';

// Atualizar UI
async function updateSubscriptionUI(session) {
    if (session) {
        // Verificar status na DB antes de atualizar botão
        await checkSubscriptionStatus(session.user);

        if (isSubscriber) {
            subscribeBtn.innerHTML = `GERIR SUBSCRIÇÃO<span class="subscribe-btn-email">${session.user.email}</span>`;
        } else {
            subscribeBtn.innerHTML = `COMEÇAR A RECEBER<span class="subscribe-btn-email">${session.user.email}</span>`;
        }
    } else {
        isSubscriber = false;
        subscribeBtn.innerHTML = "COMEÇAR A RECEBER";
    }
}

// Inicialização
async function checkInitialSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateSubscriptionUI(session);
}
checkInitialSession();

// Listener de auth state
supabaseClient.auth.onAuthStateChange((event, session) => {
    updateSubscriptionUI(session);
});

