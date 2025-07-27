// Ficheiro: server/routes/webhooks.js

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription'); // Importamos o nosso modelo

// O segredo que guardámos no .env
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // 1. VERIFICAÇÃO: Usamos o segredo para garantir que o pedido veio do Stripe.
        // Se não vier, isto vai dar um erro e o bloco catch trata disso.
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`❌ Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. AÇÃO: Se a verificação passou, vemos que tipo de evento recebemos.
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // 3. LIGAÇÃO: Recuperamos os nossos IDs que passámos na metadata!
        const { userId, productId } = session.metadata;

        // Se não tivermos os IDs, não podemos criar a subscrição na nossa BD.
        if (!userId || !productId) {
            return res.status(400).send('Webhook Error: Faltam os IDs de utilizador ou produto na metadata.');
        }

        try {
            // 4. CRIAÇÃO: Criamos a nova subscrição na nossa base de dados.
            const newSubscription = new Subscription({
                user: userId,
                product: productId,
                stripeSubscriptionId: session.subscription, // ID da subscrição gerada
                status: 'active', // A subscrição começa logo ativa
                // O objeto da subscrição tem o campo 'current_period_end' em formato Unix timestamp (segundos)
                // Nós convertemos para uma data JavaScript (milissegundos)
                currentPeriodEnd: new Date(session.created * 1000 + 30 * 24 * 60 * 60 * 1000)
            });

            await newSubscription.save();
            console.log(`✅ Subscrição para o utilizador ${userId} guardada na BD!`);

        } catch (err) {
            console.error('Erro ao guardar a subscrição na base de dados:', err);
            return res.status(500).send('Erro interno do servidor.');
        }
    }

    // 5. CONFIRMAÇÃO: Enviamos uma resposta 200 OK ao Stripe para ele saber que
    // recebemos e processámos o evento com sucesso. Se não o fizermos, o Stripe
    // vai continuar a tentar enviar o mesmo evento várias vezes.
    res.status(200).send();
});

module.exports = router;