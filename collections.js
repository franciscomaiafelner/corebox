document.addEventListener('DOMContentLoaded', () => {
  const store = window.CoreBoxSubscriptions;
  if (!store) {
    return;
  }

  const grid = document.getElementById('collectionsGrid');
  const filterButtons = Array.from(document.querySelectorAll('.filter-pill'));
  let activeFilter = 'all';
  const placeholderHero = './images/placeholder-box.svg';
  const cardConfig = {
    'artisanal-coffee': {
      price: '$32.00 / month',
      frequency: 'Ships every 4 weeks',
      route: 'products/product-cafe-artesanal.html',
      categoryKey: 'food',
      hero: './images/food.png',
    },
    'curated-reading': {
      price: '$28.00 / month',
      frequency: 'Ships monthly',
      route: 'products/product-leitura-curada.html',
      categoryKey: 'wellness',
      hero: './images/wellness.png',
    },
    'ceramics-diy': {
      price: '$38.00 / month',
      frequency: 'Ships monthly',
      route: 'products/product-kit-ceramica.html',
      categoryKey: 'family',
      hero: './images/family.png',
    },
    'herbal-harmony': {
      price: '$26.00 / month',
      frequency: 'Ships monthly',
      route: 'products/product-herbal-harmony.html',
      categoryKey: 'wellness',
      hero: './images/herbal.png',
    },
    'fromagerie-voyage': {
      price: '$42.00 / month',
      frequency: 'Ships every 4 weeks',
      route: 'products/product-fromagerie-voyage.html',
      categoryKey: 'food',
      hero: './images/cheese.png',
    },
    'home-glow-box': {
      price: '$34.00 / month',
      frequency: 'Ships monthly',
      route: 'products/product-home-glow-box.html',
      categoryKey: 'wellness',
      hero: './images/candles.png',
    },
    'nordic-skincare-ritual': {
      price: '$39.00 / month',
      frequency: 'Ships every 2 months',
      route: 'products/product-nordic-skincare-ritual.html',
      categoryKey: 'wellness',
      hero: './images/skin.png',
    },
    'arthaus-kit': {
      price: '$35.00 / month',
      frequency: 'Ships monthly',
      route: 'products/product-arthaus-kit.html',
      categoryKey: 'family',
      hero: './images/paint.png',
    },
    'mindful-moments': {
      price: '$28.00 / month',
      frequency: 'Ships monthly',
      route: 'products/product-mindful-moments.html',
      categoryKey: 'wellness',
      hero: './images/mindful.png',
    },
  };

  function enhanceSubscription(subscription) {
    const config = cardConfig[subscription.id] || {};
    return {
      ...subscription,
      price: config.price || subscription.price || '',
      frequency: config.frequency || subscription.frequency || '',
      route: config.route || subscription.route || 'index.html',
      categoryKey: config.categoryKey || subscription.categoryKey || 'wellness',
      hero: config.hero || subscription.hero || './images/wellness.png',
    };
  }

  let subscriptions = store.getAllSubscriptions().map((subscription) => enhanceSubscription(subscription));

  function renderCards() {
    if (!grid) {
      return;
    }

    grid.innerHTML = '';

    const filtered = subscriptions.filter((subscription) => {
      if (activeFilter === 'all') {
        return true;
      }
      return subscription.categoryKey === activeFilter;
    });

    filtered.forEach((subscription) => {
      const card = document.createElement('article');
      card.className = 'collection-card';
      card.dataset.category = subscription.categoryKey;

      const thumb = document.createElement('div');
      thumb.className = 'collection-card-thumb';
      const img = document.createElement('img');
      img.src = subscription.hero;
      img.alt = `${subscription.name} box preview`;
      thumb.appendChild(img);

      const meta = document.createElement('div');
      meta.className = 'collection-card-meta';
      const badge = document.createElement('span');
      badge.className = 'collection-badge';
      badge.textContent = subscription.badge;
      const frequency = document.createElement('span');
      frequency.className = 'collection-frequency';
      frequency.textContent = subscription.frequency;
      meta.appendChild(badge);
      meta.appendChild(frequency);

      const title = document.createElement('h3');
      title.textContent = subscription.name;

      const description = document.createElement('p');
      description.textContent = subscription.description;

      const footer = document.createElement('div');
      footer.className = 'collection-footer';

      const categoryTag = document.createElement('span');
      categoryTag.className = 'tag';
      categoryTag.textContent = subscription.category;

      const actions = document.createElement('div');
      actions.className = 'collection-footer-actions';

      const primaryLink = document.createElement('a');
      primaryLink.href = subscription.route;
      primaryLink.className = 'collection-link';
      primaryLink.textContent = 'View Box';

      actions.appendChild(primaryLink);

      footer.appendChild(categoryTag);
      footer.appendChild(actions);

      const price = document.createElement('div');
      price.className = 'collection-price';
      price.innerHTML = `<span class="price-amount">${subscription.price}</span>`;

      card.appendChild(thumb);
      card.appendChild(meta);
      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(price);
      card.appendChild(footer);

      grid.appendChild(card);
    });
  }

  function handleFilterChange(newFilter) {
    activeFilter = newFilter;
    filterButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === newFilter);
    });
    renderCards();
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleFilterChange(button.dataset.filter || 'all');
    });
  });

  window.addEventListener('corebox:subscriptions-updated', (event) => {
    subscriptions = event.detail.map((subscription) => enhanceSubscription(subscription));
    renderCards();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === store.storageKey) {
      subscriptions = store.getAllSubscriptions().map((subscription) => enhanceSubscription(subscription));
      renderCards();
    }
  });

  renderCards();
});
