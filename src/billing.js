import Stripe from 'stripe';
import { db } from './db.js';
import { userError } from './errors.js';
import { PLANS } from './plans.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const appUrl = () => process.env.APP_URL || 'http://localhost:3000';

function requireStripe() {
  if (!stripe) throw userError(503, 'Payments are not set up yet.');
  return stripe;
}

export async function createCheckout(user, planKey) {
  const plan = PLANS[planKey];
  if (!plan) throw userError(400, 'Unknown plan.');
  if (user.paid && user.stripe_subscription_id && plan.mode === 'subscription') {
    throw userError(409, 'You already have a plan. Use Manage billing to change it.');
  }

  const session = await requireStripe().checkout.sessions.create({
    mode: plan.mode,
    line_items: plan.prices.map((env) => ({ price: process.env[env], quantity: 1 })),
    ...(user.stripe_customer_id
      ? { customer: user.stripe_customer_id }
      : { customer_email: user.email, ...(plan.mode === 'payment' && { customer_creation: 'always' }) }),
    client_reference_id: String(user.id),
    metadata: { plan: planKey },
    success_url: `${appUrl()}/#account?paid=1`,
    cancel_url: `${appUrl()}/#account`,
  });
  return session.url;
}

export async function createPortal(user) {
  if (!user.stripe_customer_id) throw userError(400, 'No billing account yet.');
  const session = await requireStripe().billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${appUrl()}/#account`,
  });
  return session.url;
}

const isActive = (subscription) => ['active', 'trialing'].includes(subscription.status);

/** Express handler. Needs the raw request body for signature checks. */
export async function webhook(req, res) {
  let event;
  try {
    event = requireStripe().webhooks.constructEvent(
      req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  const obj = event.data.object;
  switch (event.type) {
    case 'checkout.session.completed': {
      // Webhooks can arrive out of order, so read the subscription's current status.
      const paid = obj.subscription ? isActive(await stripe.subscriptions.retrieve(obj.subscription)) : true;
      db.prepare(`
        UPDATE users SET paid = ?, plan = ?, stripe_customer_id = ?,
          stripe_subscription_id = COALESCE(?, stripe_subscription_id)
        WHERE id = ?`)
        .run(paid ? 1 : 0, obj.metadata.plan, obj.customer, obj.subscription, Number(obj.client_reference_id));
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      db.prepare('UPDATE users SET paid = ? WHERE stripe_subscription_id = ?').run(isActive(obj) ? 1 : 0, obj.id);
      break;
  }
  res.json({ received: true });
}
