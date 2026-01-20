const getEnv = () => {
    const hostname = window.location.hostname;

    // Debug: Isto vai aparecer na consola do browser (F12)
    console.log("Hostname detetado:", hostname);

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    return 'production';
};

/*
const CONFIG = {
    development: {
        supabaseUrl: 'https://hdjjbplyqzfzkkueppsf.supabase.co',
        supabaseKey: 'sb_publishable_rjLlXKED9Z1hEfGQIt8z_w_UOG7BZwY'
    },
    production: {
        supabaseUrl: 'https://svifzwpmcafkwrxadkvt.supabase.co',
        supabaseKey: 'sb_publishable__149WhD6ENYlRbhEEvQe9g_g0TwX4Qy'
    }
};

const getEnv = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    return 'production';
};

const currentEnv = getEnv();
const appConfig = CONFIG[currentEnv];

console.log(`Environment: ${currentEnv}`);

*/