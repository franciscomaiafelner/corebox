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
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`❌ Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Usar um switch para lidar com diferentes tipos de eventos
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { userId, productId } = session.metadata;

            if (!userId || !productId) {
                console.log('❌ Metadata em falta no checkout.session.completed');
                return res.status(400).send('Webhook Error: Faltam IDs na metadata.');
            }

            const newSubscription = new Subscription({
                user: userId,
                product: productId,
                stripeSubscriptionId: session.subscription,
                status: 'active',
                currentPeriodEnd: new Date(session.created * 1000 + 30 * 24 * 60 * 60 * 1000) // Simplificado, idealmente viria do objeto de subscrição
            });

            await newSubscription.save();
            console.log(`✅ Nova subscrição para o utilizador ${userId} guardada!`);
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const newStatus = subscription.status;
            const newPeriodEnd = new Date(subscription.current_period_end * 1000);

            await Subscription.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                { status: newStatus, currentPeriodEnd: newPeriodEnd }
            );
            console.log(`✅ Subscrição ${subscription.id} atualizada para o estado: ${newStatus}`);
            break;
        }
      
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            await Subscription.findOneAndUpdate(
              { stripeSubscriptionId: subscription.id },
              { status: 'canceled' } // ou subscription.status que também será 'canceled'
            );
            console.log(`✅ Subscrição ${subscription.id} marcada como cancelada.`);
            break;
        }

        default:
            console.log(`🔔 Evento não tratado do tipo: ${event.type}`);
    }

    // Devolver uma resposta 200 para confirmar o recebimento do evento
    res.status(200).send();
});

module.exports = router;