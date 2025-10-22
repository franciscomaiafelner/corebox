(function (window) {
  const STORAGE_KEY = 'coreboxSubscriptions';

  const templates = [
    {
      id: 'artisanal-coffee',
      name: 'Artisanal Coffee',
      badge: 'Best-seller',
      pill: 'Premium Curation',
      category: 'Food & Drink',
      description: 'Fresh beans sourced from independent roasters and delivered to your door.',
      meta: {
        active: 'Renews every 4 weeks • Ships from Portland, OR',
        paused: 'Delivery paused • Resume before August 5 to stay on schedule',
      },
      defaultStatus: 'inactive',
    },
    {
      id: 'curated-reading',
      name: 'Curated Reading',
      badge: 'Calm Mode',
      pill: 'Reading Ritual',
      category: 'Wellness',
      description: 'Hand-picked literature paired with sensory treats and guided reflections.',
      meta: {
        active: 'Renews monthly • Next shipment July 28',
        paused: 'Currently paused • Restart before August 10 to stay in the club',
      },
      defaultStatus: 'inactive',
    },
    {
      id: 'ceramics-diy',
      name: 'Ceramics DIY Kit',
      badge: 'Handcrafted',
      pill: 'Creative Challenge',
      category: 'Family',
      description: 'Clay, tools, and artist-led projects to sculpt something new each month.',
      meta: {
        active: 'Ships every first Monday • Includes kiln-free clay refills',
        paused: 'Production paused • Resume to receive the next sculpting prompt',
      },
      defaultStatus: 'inactive',
    },
    {
      id: 'herbal-harmony',
      name: 'Herbal Harmony',
      badge: 'Botanical Blend',
      pill: 'Tea Ritual',
      category: 'Wellness',
      description: 'Blends of organic teas and botanical infusions crafted by European herbalists.',
      meta: {
        active: 'Ships monthly • Small-batch blends steeped by European herbalists',
        paused: 'Delivery paused • Resume to receive the next infusion curation',
      },
      defaultStatus: 'inactive',
    },
    {
      id: 'fromagerie-voyage',
      name: 'Fromagerie Voyage',
      badge: 'Cheese Tour',
      pill: 'Gourmet Journey',
      category: 'Food & Drink',
      description: 'Curated selection of artisanal cheeses from small dairies across Europe.',
      meta: {
        active: 'Ships every 4 weeks • Packed chilled for peak flavor on arrival',
        paused: 'Subscription paused • Resume before the next tasting window closes',
      },
      defaultStatus: 'inactive',
    },
    {
      id: 'home-glow-box',
      name: 'Home Glow Box',
      badge: 'Cozy Living',
      pill: 'Ambient Living',
      category: 'Wellness / Home',
      description: 'Eco-candles, diffusers, and handmade decor to elevate your space sustainably.',
      meta: {
        active: 'Ships monthly • Eco-friendly scents and sustainable decor accents',
        paused: 'Delivery paused • Resume to refresh your home atmosphere next month',
      },
      defaultStatus: 'inactive',
    },
    {
      id: 'nordic-skincare-ritual',
      name: 'Nordic Skincare Ritual',
      badge: 'Clean Beauty',
      pill: 'Slow Care',
      category: 'Wellness',
      description: 'Minimalist self-care essentials made with cold-pressed ingredients from Nordic producers.',
      meta: {
        active: 'Ships every 2 months • Formulated with cold-pressed Nordic ingredients',
        paused: 'Routine paused • Restart to receive the next ritual collection',
      },
      defaultStatus: 'inactive',
    },
    {
      id: 'arthaus-kit',
      name: 'ArtHaus Kit',
      badge: 'Studio Session',
      pill: 'Creative Play',
      category: 'Family & Hobby',
      description: 'Painting, sketching, and mixed-media projects guided by local artists.',
      meta: {
        active: 'Ships monthly • Supplies and guided projects from local artists',
        paused: 'Project paused • Resume before the next workshop release',
      },
      defaultStatus: 'inactive',
    },
    {
      id: 'mindful-moments',
      name: 'Mindful Moments',
      badge: 'Calm Focus',
      pill: 'Daily Reset',
      category: 'Wellness',
      description: 'Mindfulness tools, journals, and calming rituals curated by mental-health professionals.',
      meta: {
        active: 'Ships monthly • Curated by mental health professionals for daily rituals',
        paused: 'Delivery paused • Reactivate to receive the next mindfulness toolkit',
      },
      defaultStatus: 'inactive',
    },
  ];

  function getTemplateMap() {
    return templates.reduce((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {});
  }

  function loadStatusMap() {
    const templateMap = getTemplateMap();
    let stored;
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (error) {
      stored = {};
    }

    if (stored && typeof stored === 'object') {
      Object.keys(stored).forEach((key) => {
        if (!templateMap[key]) {
          delete stored[key];
        }
      });
    } else {
      stored = {};
    }

    templates.forEach((template) => {
      if (!stored[template.id]) {
        stored[template.id] = template.defaultStatus || 'inactive';
      }
    });

    return stored;
  }

  function buildSubscriptions(statusMap) {
    const templateMap = getTemplateMap();
    return templates.map((template) => {
      const status = statusMap[template.id] || template.defaultStatus || 'inactive';
      return {
        ...template,
        status,
      };
    });
  }

  function saveStatusMap(statusMap) {
    const normalized = {};
    Object.keys(statusMap).forEach((key) => {
      normalized[key] = statusMap[key];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    const subscriptions = buildSubscriptions(normalized);
    window.dispatchEvent(
      new CustomEvent('corebox:subscriptions-updated', { detail: subscriptions }),
    );
    return subscriptions;
  }

  function loadSubscriptions() {
    const statusMap = loadStatusMap();
    return buildSubscriptions(statusMap);
  }

  function getAllSubscriptions() {
    return buildSubscriptions(loadStatusMap());
  }

  function setStatus(id, status) {
    const statusMap = loadStatusMap();
    statusMap[id] = status;
    return saveStatusMap(statusMap);
  }

  function cancel(id) {
    const statusMap = loadStatusMap();
    statusMap[id] = 'inactive';
    return saveStatusMap(statusMap);
  }

  function getById(id) {
    const template = getTemplateMap()[id];
    if (!template) {
      return null;
    }
    const statusMap = loadStatusMap();
    return {
      ...template,
      status: statusMap[id] || template.defaultStatus || 'inactive',
    };
  }

  const api = {
    templates,
    storageKey: STORAGE_KEY,
    loadSubscriptions,
    getAllSubscriptions,
    setStatus,
    cancel,
    getById,
  };

  window.CoreBoxSubscriptions = api;
})(window);
