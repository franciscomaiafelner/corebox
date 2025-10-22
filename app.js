document.addEventListener('DOMContentLoaded', () => {
  const views = Array.from(document.querySelectorAll('.view'));
  const topNavButtons = Array.from(document.querySelectorAll('[data-view]'));
  const overlay = document.getElementById('consumer-panel');
  const openPanelButton = document.getElementById('openConsumerPanel');
  const closePanelButton = document.getElementById('closeConsumerPanel');
  const switchToSellerButton = document.getElementById('switchToSeller');
  const backToConsumerButton = document.getElementById('backToConsumer');

  const sellerTabs = Array.from(document.querySelectorAll('.seller-controls .tab'));
  const sellerViews = Array.from(document.querySelectorAll('.seller-view'));
  const sellerQuickActionButtons = Array.from(document.querySelectorAll('.seller-quick-actions [data-target], .seller-controls [data-target], .section-header [data-target], .ghost[data-target], .secondary[data-target]'));
  const pdfButton = document.getElementById('generatePdf');
  const subscriptionList = document.getElementById('subscriptionList');
  const exploreBoxesButton = document.getElementById('exploreBoxes');
  const store = window.CoreBoxSubscriptions;
  let subscriptions = store ? store.loadSubscriptions() : [];
  let manageFocusId = null;

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has('manage')) {
    manageFocusId = currentUrl.searchParams.get('manage');
    currentUrl.searchParams.delete('manage');
    const paramsString = currentUrl.searchParams.toString();
    const sanitized = `${currentUrl.pathname}${paramsString ? `?${paramsString}` : ''}${currentUrl.hash}`;
    window.history.replaceState({}, '', sanitized);
  }

  function showView(id) {
    views.forEach((view) => {
      view.classList.toggle('active', view.id === id);
    });

    topNavButtons.forEach((button) => {
      if (button.dataset.view) {
        button.classList.toggle('active', button.dataset.view === id);
      }
    });

    if (id === 'seller-app') {
      showSellerView('seller-dashboard');
    }
  }

  function showSellerView(id) {
    sellerViews.forEach((view) => {
      view.classList.toggle('active', view.id === id);
    });

    sellerTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.target === id);
    });
  }

  function openPanel() {
    if (overlay) {
      overlay.classList.add('open');
    }
  }

  function closePanel() {
    if (overlay) {
      overlay.classList.remove('open');
    }
  }

  function maybeOpenPanelFromDeepLink() {
    const hash = window.location.hash;
    if (hash === '#manage-subscriptions' || hash === '#manage') {
      showView('consumer-home');
      openPanel();
      const search = window.location.search || '';
      window.history.replaceState({}, '', `${window.location.pathname}${search}`);
      return;
    }

    if (manageFocusId) {
      showView('consumer-home');
      openPanel();
    }
  }

  function findSubscription(id) {
    return subscriptions.find((subscription) => subscription.id === id);
  }

  function createActionButton({ label, className, onClick }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  function renderSubscriptions() {
    if (!subscriptionList) {
      return;
    }

    subscriptionList.innerHTML = '';
    const visibleSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === 'active' || subscription.status === 'paused',
    );

    if (visibleSubscriptions.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'subscription-empty';
      emptyState.textContent = 'No active subscriptions yet. Explore new boxes to get started.';
      subscriptionList.appendChild(emptyState);
      return;
    }

    visibleSubscriptions.forEach((subscription) => {
      const listItem = document.createElement('li');
      listItem.classList.add('subscription-card', subscription.status);
      listItem.dataset.subscriptionId = subscription.id;

      if (subscription.id === manageFocusId) {
        listItem.classList.add('subscription-card-focus');
        setTimeout(() => {
          listItem.classList.remove('subscription-card-focus');
        }, 2400);
        manageFocusId = null;
      }

      const infoWrapper = document.createElement('div');
      infoWrapper.className = 'subscription-info';

      const titleRow = document.createElement('div');
      titleRow.className = 'subscription-title-row';

      const nameElement = document.createElement('p');
      nameElement.className = 'subscription-name';
      nameElement.textContent = subscription.name;
      titleRow.appendChild(nameElement);

      if (subscription.status === 'paused') {
        const flag = document.createElement('span');
        flag.className = 'subscription-flag';
        flag.textContent = 'Paused';
        titleRow.appendChild(flag);
      }

      infoWrapper.appendChild(titleRow);

      const meta = document.createElement('span');
      meta.className = 'subscription-meta';
      meta.textContent =
        subscription.status === 'paused' ? subscription.meta.paused : subscription.meta.active;
      infoWrapper.appendChild(meta);

      listItem.appendChild(infoWrapper);

      const actions = document.createElement('div');
      actions.className = 'subscription-actions';

      if (subscription.status === 'active') {
        actions.appendChild(
          createActionButton({
            label: 'Skip Next',
            className: 'secondary',
            onClick: () => handleSkipNext(subscription.id),
          }),
        );
        actions.appendChild(
          createActionButton({
            label: 'Cancel',
            className: 'ghost',
            onClick: () => handleCancel(subscription.id),
          }),
        );
      } else if (subscription.status === 'paused') {
        actions.appendChild(
          createActionButton({
            label: 'Resume',
            className: 'primary',
            onClick: () => handleResume(subscription.id),
          }),
        );
        actions.appendChild(
          createActionButton({
            label: 'Cancel',
            className: 'ghost',
            onClick: () => handleCancel(subscription.id),
          }),
        );
      }

      listItem.appendChild(actions);
      subscriptionList.appendChild(listItem);
    });
  }

  function handleSkipNext(id) {
    const subscription = findSubscription(id);
    if (!subscription || subscription.status !== 'active') {
      return;
    }

    if (store) {
      subscriptions = store.setStatus(id, 'paused');
    } else {
      subscription.status = 'paused';
    }
    renderSubscriptions();
  }

  function handleResume(id) {
    const subscription = findSubscription(id);
    if (!subscription || subscription.status !== 'paused') {
      return;
    }

    if (store) {
      subscriptions = store.setStatus(id, 'active');
    } else {
      subscription.status = 'active';
    }
    renderSubscriptions();
  }

  function handleCancel(id) {
    const subscription = findSubscription(id);
    if (!subscription) {
      return;
    }

    if (store) {
      subscriptions = store.cancel(id);
    } else {
      subscription.status = 'inactive';
    }
    renderSubscriptions();
  }

  if (store) {
    window.addEventListener('corebox:subscriptions-updated', (event) => {
      subscriptions = event.detail;
      renderSubscriptions();
    });

    window.addEventListener('storage', (event) => {
      if (event.key === store.storageKey) {
        subscriptions = store.loadSubscriptions();
        renderSubscriptions();
      }
    });
  }

  topNavButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.view;
      if (target) {
        showView(target);
      }
    });
  });

  if (openPanelButton && overlay) {
    openPanelButton.addEventListener('click', openPanel);
  }

  if (closePanelButton && overlay) {
    closePanelButton.addEventListener('click', closePanel);
  }

  if (exploreBoxesButton) {
    exploreBoxesButton.addEventListener('click', () => {
      window.location.href = 'collections.html';
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closePanel();
      }
    });
  }

  if (switchToSellerButton) {
    switchToSellerButton.addEventListener('click', () => {
      closePanel();
      showView('seller-app');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (backToConsumerButton) {
    backToConsumerButton.addEventListener('click', () => {
      showView('consumer-home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  sellerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      if (target) {
        showSellerView(target);
      }
    });
  });

  sellerQuickActionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      if (target) {
        showSellerView(target);
      }
    });
  });

  if (pdfButton) {
    pdfButton.addEventListener('click', () => {
      window.alert('Prototype action: shipping labels would download as a PDF in the full application.');
    });
  }

  renderSubscriptions();
  maybeOpenPanelFromDeepLink();
  drawPerformanceChart();
});

function drawPerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  if (dpr !== 1) {
    const logicalWidth = canvas.width;
    const logicalHeight = canvas.height;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;
    ctx.scale(dpr, dpr);
  }

  const dataPoints = [28500, 31200, 33650, 35800, 39500, 42530];
  const labels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const margin = { top: 36, right: 24, bottom: 46, left: 60 };
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(...dataPoints) * 1.1;
  const minValue = Math.min(...dataPoints) * 0.9;
  const range = maxValue - minValue;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const gridLineCount = 4;
  ctx.strokeStyle = 'rgba(16, 32, 49, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  for (let i = 0; i <= gridLineCount; i++) {
    const y = margin.top + (chartHeight / gridLineCount) * i;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();

    const value = maxValue - (range / gridLineCount) * i;
    ctx.fillStyle = '#516170';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`$${Math.round(value).toLocaleString()}`, margin.left - 10, y);
  }

  ctx.setLineDash([]);

  dataPoints.forEach((_, index) => {
    const x = margin.left + (chartWidth / (dataPoints.length - 1)) * index;
    ctx.fillStyle = '#516170';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labels[index], x, height - margin.bottom + 16);
  });

  ctx.beginPath();
  dataPoints.forEach((value, index) => {
    const x = margin.left + (chartWidth / (dataPoints.length - 1)) * index;
    const y = margin.top + chartHeight * (1 - (value - minValue) / range);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = '#5850ec';
  ctx.lineWidth = 3;
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
  gradient.addColorStop(0, 'rgba(88, 80, 236, 0.2)');
  gradient.addColorStop(1, 'rgba(88, 80, 236, 0)');

  ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
  ctx.lineTo(margin.left, margin.top + chartHeight);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  dataPoints.forEach((value, index) => {
    const x = margin.left + (chartWidth / (dataPoints.length - 1)) * index;
    const y = margin.top + chartHeight * (1 - (value - minValue) / range);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#5850ec';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}
