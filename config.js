const CONFIG = {
    development: {
        supabaseUrl: 'https://hdjjbplyqzfzkkueppsf.supabase.co',
        supabaseKey: 'sb_publishable_rjLlXKED9Z1hEfGQIt8z_w_UOG7BZwY'
    },
    production: {
        supabaseUrl: 'https://hdjjbplyqzfzkkueppsf.supabase.co',
        supabaseKey: 'sb_publishable_rjLlXKED9Z1hEfGQIt8z_w_UOG7BZwY'
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
