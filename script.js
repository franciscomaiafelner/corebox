const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.carousel-btn.next');
const prevButton = document.querySelector('.carousel-btn.prev');
const dotsNav = document.querySelector('.carousel-nav');
const dots = Array.from(dotsNav.children);

const slideWidth = slides[0].getBoundingClientRect().width;

// Arrange the slides next to one another
const setSlidePosition = (slide, index) => {
    slide.style.left = slideWidth * index + 'px';
};
slides.forEach(setSlidePosition);

const moveToSlide = (track, currentSlide, targetSlide) => {
    track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
    currentSlide.classList.remove('current-slide');
    targetSlide.classList.add('current-slide');
};

const updateDots = (currentDot, targetDot) => {
    currentDot.classList.remove('current-slide');
    targetDot.classList.add('current-slide');
};

// Next button
nextButton.addEventListener('click', e => {
    const currentSlide = track.querySelector('.current-slide');
    const nextSlide = currentSlide.nextElementSibling || slides[0]; // Loop back to start
    const currentDot = dotsNav.querySelector('.current-slide');
    const nextDot = currentDot.nextElementSibling || dots[0]; // Loop back

    moveToSlide(track, currentSlide, nextSlide);
    updateDots(currentDot, nextDot);
});

// Prev button
prevButton.addEventListener('click', e => {
    const currentSlide = track.querySelector('.current-slide');
    const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1]; // Loop to end
    const currentDot = dotsNav.querySelector('.current-slide');
    const prevDot = currentDot.previousElementSibling || dots[dots.length - 1];

    moveToSlide(track, currentSlide, prevSlide);
    updateDots(currentDot, prevDot);
});

// Dot indicators
dotsNav.addEventListener('click', e => {
    const targetDot = e.target.closest('button');
    if (!targetDot) return;

    const currentSlide = track.querySelector('.current-slide');
    const currentDot = dotsNav.querySelector('.current-slide');
    const targetIndex = dots.findIndex(dot => dot === targetDot);
    const targetSlide = slides[targetIndex];

    moveToSlide(track, currentSlide, targetSlide);
    updateDots(currentDot, targetDot);
});

// Handle resize to fix slide positioning
window.addEventListener('resize', () => {
    const newSlideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach((slide, index) => {
        slide.style.left = newSlideWidth * index + 'px';
    });
    // Reset to current slide position without animation to prevent glitch
    const currentSlide = track.querySelector('.current-slide');
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
    setTimeout(() => {
        track.style.transition = 'transform 0.4s ease-in-out';
    }, 50);
});


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
    if (isSubscriber) {
        // Se é assinante -> Portal
        subscribeBtn.disabled = true;
        subscribeBtn.innerText = "OPENING PORTAL...";
        await callEdgeFunction('portal', { returnUrl: window.location.origin });
        subscribeBtn.disabled = false;
        subscribeBtn.innerText = "GERIR SUBSCRIÇÃO";
    } else {
        // Se não é assinante -> Checkout
        subscribeBtn.disabled = true;
        subscribeBtn.innerText = "REDIRECTING...";
        await callEdgeFunction('checkout'); // Preço hardcoded no backend
        subscribeBtn.disabled = false;
        subscribeBtn.innerText = "SUBSCRIBE NOW";
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
            emailRedirectTo: window.location.origin
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

// Atualizar UI
async function updateSubscriptionUI(session) {
    if (session) {
        userEmailDisplay.innerText = `Logged in as: ${session.user.email}`;
        if (signOutBtn) signOutBtn.style.display = 'block';
        if (userStatusRow) userStatusRow.style.display = 'flex';

        // Verificar status na DB antes de atualizar botão
        await checkSubscriptionStatus(session.user);

        if (isSubscriber) {
            subscribeBtn.innerText = "GERIR SUBSCRIÇÃO";
        } else {
            subscribeBtn.innerText = "COMEÇAR A RECEBER";
        }
    } else {
        isSubscriber = false;
        subscribeBtn.innerText = "COMEÇAR A RECEBER";
        userEmailDisplay.innerText = "";
        if (signOutBtn) signOutBtn.style.display = 'none';
        if (userStatusRow) userStatusRow.style.display = 'none';
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

