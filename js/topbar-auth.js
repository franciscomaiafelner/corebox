// Topbar Auth — shared login button logic for all pages
(function () {
    const supabaseUrl = appConfig.supabaseUrl;
    const supabaseKey = appConfig.supabaseKey;

    // Reuse existing client if available (index.html creates one in script.js)
    const client = window._supabaseClient ||
        supabase.createClient(supabaseUrl, supabaseKey);
    window._supabaseClient = client;

    const loginBtn = document.getElementById('topbar-login-btn');
    const authModal = document.getElementById('auth-modal');
    const closeModal = document.getElementById('close-modal');
    const authForm = document.getElementById('auth-form');

    if (!loginBtn || !authModal) return;

    // Open modal on login btn click (if not logged in)
    loginBtn.addEventListener('click', async () => {
        const { data: { session } } = await client.auth.getSession();

        if (session) {
            // Already logged in — sign out
            await client.auth.signOut();
        } else {
            // Not logged in — open modal
            authModal.style.display = 'flex';
        }
    });

    // Close modal
    if (closeModal) {
        closeModal.onclick = () => authModal.style.display = 'none';
    }

    // Close on overlay click
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // Magic link form
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const messageDiv = document.getElementById('auth-message');

            const { error } = await client.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) {
                messageDiv.innerText = 'Erro: ' + error.message;
            } else {
                messageDiv.innerText = 'Verifica o teu email para o link de acesso!';
            }
        };
    }

    // Update topbar button based on auth state
    function updateTopbarBtn(session) {
        if (session) {
            loginBtn.innerText = 'Sair';
            loginBtn.classList.add('logged-in');
            loginBtn.title = session.user.email;
        } else {
            loginBtn.innerText = 'Iniciar sessão';
            loginBtn.classList.remove('logged-in');
            loginBtn.title = '';
        }
    }

    // Check initial session
    async function init() {
        const { data: { session } } = await client.auth.getSession();
        updateTopbarBtn(session);
    }
    init();

    // Listen for auth changes
    client.auth.onAuthStateChange((event, session) => {
        updateTopbarBtn(session);
        if (event === 'SIGNED_IN') {
            authModal.style.display = 'none';
        }
    });
})();
