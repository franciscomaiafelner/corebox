// Ficheiro: server/routes/webhooks.js

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    // ... (verificação do webhook continua igual)
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`❌ Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    switch (event.type) {
        // ... (outros cases ficam iguais)
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { userId, productId } = session.metadata;

            const subscriptionData = await stripe.subscriptions.retrieve(session.subscription);
            
            const address = session.customer_details.address;
            const shippingAddress = {
                street: address.line1,
                street2: address.line2,
                city: address.city,
                postalCode: address.postal_code,
                country: address.country,
            };

            const newSubscription = new Subscription({
                user: userId,
                product: productId,
                stripeSubscriptionId: subscriptionData.id,
                status: subscriptionData.status,
                currentPeriodEnd: new Date(session.created * 1000 + 30 * 24 * 60 * 60 * 1000), 
                shippingAddress: shippingAddress 
            });

            await newSubscription.save();
            console.log(`✅ Nova subscrição com morada para o utilizador ${userId} guardada!`);
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            
            const updateFields = {
                status: subscription.status,
                currentPeriodEnd: new Date(session.created * 1000 + 30 * 24 * 60 * 60 * 1000),
            };
 
            if (subscription.shipping && subscription.shipping.address) {
                const address = subscription.shipping.address;
                updateFields.shippingAddress = {
                    street: address.line1,
                    street2: address.line2,
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

        case 'customer.updated': {
            const customer = event.data.object;

            // ***** A CORREÇÃO ESTÁ AQUI *****
            // Verificamos se a atualização contém o objeto 'address' diretamente
            if (customer.address) { 
                const address = customer.address;
                const shippingAddress = {
                    street: address.line1,
                    street2: address.line2,
                    city: address.city,
                    postalCode: address.postal_code,
                    country: address.country,
                };

                const user = await User.findOne({ stripeCustomerId: customer.id });
                if (user) {
                    await Subscription.updateMany(
                        { user: user._id, status: 'active' },
                        { $set: { shippingAddress: shippingAddress } }
                    );
                    console.log(`✅ Morada atualizada para todas as subscrições ativas do utilizador ${user._id}`);
                }
            } else {
                console.log('❌ Nenhuma morada encontrada no evento customer.updated.');
            }
            break;
        }

        case 'customer.subscription.deleted': {
            // ... (fica igual)
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