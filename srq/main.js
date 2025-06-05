const userId = window.Telegram.WebApp.initDataUnsafe.user?.id || 'anonymous';

const storage = new MyCustomStorage('https://nnif192.github.io/test_miniapps', userId);

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://nnif192.github.io/test_miniapps/tonconnect-manifest.json',
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
