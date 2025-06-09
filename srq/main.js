class MyCustomStorage {
  constructor(baseUrl, userId) {
    this.baseUrl = baseUrl;
    this.userId = userId;
  }

  async getItem(key) {
    const res = await fetch(`${this.baseUrl}/get?user=${this.userId}&key=${key}`);
    const data = await res.json();
    return data.value;
  }

  async setItem(key, value) {
    await fetch(`${this.baseUrl}/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: this.userId, key, value })
    });
  }

  async removeItem(key) {
    await fetch(`${this.baseUrl}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: this.userId, key })
    });
  }
}

let userId = 'anonymous';

if (typeof Telegram !== 'undefined' && Telegram.WebApp?.initDataUnsafe?.user) {
  userId = Telegram.WebApp.initDataUnsafe.user.id;
} else {
  console.warn('Not running in Telegram WebApp — fallback to anonymous user');
}

const storage = new MyCustomStorage('https://test-miniapps.onrender.com', userId);

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://test-miniapps.onrender.com/tonconnect-manifest.json',
    buttonRootId: 'connect-wallet',
    storage
});

const payButton = document.getElementById('pay-button');
const status = document.getElementById('status');

tonConnectUI.onStatusChange(wallet => {
  if (wallet) {
    payButton.disabled = false;
    status.textContent = `Connected: ${wallet.account.address}`;
  } else {
    payButton.disabled = true;
    status.textContent = `Wallet not connected`;
  }
});

payButton.onclick = async () => {
  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: 'EQC...TON_RECEIVER_ADDRESS...',
        amount: (1 * 10 ** 9).toString()
      }
    ]
  };

  try {
    await tonConnectUI.sendTransaction(transaction);
    status.textContent = `✅ Payment sent!`;
  } catch (err) {
    status.textContent = `❌ Payment failed: ${err.message}`;
  }
};
