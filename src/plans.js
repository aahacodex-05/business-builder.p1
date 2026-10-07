// Every plan includes the AI assistant and deadline alerts.
// `prices` are env var names holding Stripe Price IDs, in checkout order.
export const PLANS = {
  build: {
    name: 'BUILD',
    price: '$999 one time',
    summary: 'Website, domain, email, Google profile, social setup, branding and launch.',
    mode: 'payment',
    prices: ['STRIPE_PRICE_BUILD'],
  },
  complete: {
    name: 'BUILD + GROW',
    price: '$1,299 setup + $499/mo',
    summary: 'Everything in BUILD and GROW, plus marketing strategy.',
    mode: 'subscription',
    prices: ['STRIPE_PRICE_COMPLETE_SETUP', 'STRIPE_PRICE_COMPLETE_MONTHLY'],
    featured: true,
  },
  grow: {
    name: 'GROW',
    price: '$399/mo',
    summary: 'Hosting, site edits, Google profile, social media, local SEO, reviews and a monthly report.',
    mode: 'subscription',
    prices: ['STRIPE_PRICE_GROW'],
  },
  care: {
    name: 'Website Care',
    price: '$129/mo',
    summary: 'Hosting, security, backups, updates and monitoring.',
    mode: 'subscription',
    prices: ['STRIPE_PRICE_CARE'],
  },
  careplus: {
    name: 'Website Care Plus',
    price: '$199/mo',
    summary: 'Website Care plus content updates, SEO monitoring and a monthly report.',
    mode: 'subscription',
    prices: ['STRIPE_PRICE_CARE_PLUS'],
  },
  ads: {
    name: 'Advertising Management',
    price: '$299/mo + ad spend',
    summary: 'Google, Facebook and Instagram ads, retargeting and landing pages.',
    mode: 'subscription',
    prices: ['STRIPE_PRICE_ADS'],
  },
};
