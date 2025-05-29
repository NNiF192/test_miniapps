import { TonConnectUI } from "https://unpkg.com/@tonconnect/ui@0.0.25/dist/tonconnect-ui.min.js";

const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://your-domain.com/ton-connect-manifest.json',
  buttonRootId: 'connect-wallet'
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
