// Ficheiro: server/routes/webhooks.js

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');

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

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { userId, productId } = session.metadata;

            // CORREÇÃO 1: Verificar se customer_details e address existem
            if (!session.customer_details || !session.customer_details.address) {
                console.log('❌ Morada em falta no evento checkout.session.completed');
                // Ainda assim continuamos, podemos querer guardar a subscrição sem morada
            }
            
            const address = session.customer_details.address;
            const shippingAddress = {
                street: address.line1,
                street2: address.line2,
                city: address.city,
                postalCode: address.postal_code,
                country: address.country,
            };

            const subscriptionData = await stripe.subscriptions.retrieve(session.subscription);

            const newSubscription = new Subscription({
                user: userId,
                product: productId,
                stripeSubscriptionId: session.subscription,
                status: subscriptionData.status, // Usar o status real da subscrição
                currentPeriodEnd: new Date(session.created * 1000 + 30 * 24 * 60 * 60 * 1000), // Usar a data real
                shippingAddress: shippingAddress // CORREÇÃO 2: Adicionar a morada aqui
            });

            await newSubscription.save();
            console.log(`✅ Nova subscrição com morada para o utilizador ${userId} guardada!`);
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            
            const updateFields = {
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            };

            // ATUALIZAÇÃO BÓNUS: Sincronizar a morada se ela for alterada no Portal do Cliente
            if (subscription.shipping && subscription.shipping.address) {
                const address = subscription.shipping.address;
                updateFields.shippingAddress = {
                    street: address.line1,
                    city: address.city,
                    postalCode: address.postal_code,
                    country: address.country,
                };
                console.log(`🔄 Morada da subscrição ${subscription.id} vai ser atualizada.`);
            }

            await Subscription.findOneAndUpdate(
                { stripeSubscriptionId: subscription.id },
                { $set: updateFields }
            );
            console.log(`✅ Subscrição ${subscription.id} atualizada.`);
            break;
        }
      
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            await Subscription.findOneAndUpdate(
              { stripeSubscriptionId: subscription.id },
              { status: 'canceled' }
            );
            console.log(`✅ Subscrição ${subscription.id} marcada como cancelada.`);
            break;
        }

        default:
            console.log(`🔔 Evento não tratado do tipo: ${event.type}`);
    }

    res.status(200).send();
});

module.exports = router;