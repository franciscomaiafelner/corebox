document.addEventListener('DOMContentLoaded', () => {
  const store = window.CoreBoxSubscriptions;
  if (!store) {
    return;
  }

  const actionButton = document.getElementById('subscriptionAction');
  const statusMessage = document.getElementById('subscriptionStatusMessage');

  if (!actionButton || !actionButton.dataset.subscriptionId) {
    return;
  }

  const subscriptionId = actionButton.dataset.subscriptionId;

  function updateView() {
    const subscription = store.getById(subscriptionId);
    if (!subscription) {
      return;
    }

    const isManaged = subscription.status === 'active' || subscription.status === 'paused';

    if (isManaged) {
      actionButton.textContent = 'Manage My Subscriptions';
      actionButton.dataset.mode = 'manage';
      if (statusMessage) {
        statusMessage.textContent =
          subscription.status === 'paused'
            ? 'This subscription is paused. Open your panel to resume or tweak deliveries.'
            : "You're subscribed. Open your panel anytime to fine-tune deliveries.";
        statusMessage.classList.add('is-active');
      }
    } else {
      actionButton.textContent = 'Subscribe to this Box';
      actionButton.dataset.mode = 'subscribe';
      if (statusMessage) {
        statusMessage.textContent = 'Subscribe to start receiving this experience every month.';
        statusMessage.classList.remove('is-active');
      }
    }
  }

  updateView();

  actionButton.addEventListener('click', () => {
    const mode = actionButton.dataset.mode || 'subscribe';

    if (mode === 'subscribe') {
      store.setStatus(subscriptionId, 'active');
      updateView();
      return;
    }

    window.location.href = `../index.html?manage=${subscriptionId}#manage-subscriptions`;
  });

  window.addEventListener('corebox:subscriptions-updated', (event) => {
    if (!event.detail) {
      return;
    }

    const updated = event.detail.find((entry) => entry.id === subscriptionId);
    if (updated) {
      updateView();
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === store.storageKey) {
      updateView();
    }
  });
});
