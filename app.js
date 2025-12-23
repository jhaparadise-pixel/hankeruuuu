const cardsEl = document.getElementById("cards");
const generateBtn = document.getElementById("generateBtn");
const darkToggle = document.getElementById("darkModeToggle");
const showPrivateToggle = document.getElementById("showPrivateToggle");
const generatedAt = document.getElementById("generatedAt");

darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
});

generateBtn.addEventListener("click", generateAll);

function generateAll() {
  cardsEl.innerHTML = "";

  const strength = parseInt(document.getElementById("strength").value, 10);
  const index = parseInt(document.getElementById("accountIndex").value, 10);
  const showPrivate = showPrivateToggle.checked;

  const mnemonic = bip39.generateMnemonic(strength);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);

  renderMnemonic(mnemonic, showPrivate);

  generateBTC(root, index, showPrivate);
  generateETH(seed, showPrivate);
  generateTRON(seed, showPrivate);

  generatedAt.textContent = new Date().toLocaleString();
}

function renderMnemonic(mnemonic, show) {
  const card = createCard("BIP39 助记词");
  card.innerHTML += show
    ? `<div class="value">${mnemonic}</div>`
    : `<div class="muted">（已隐藏）</div>`;
  cardsEl.appendChild(card);
}

function generateBTC(root, index, show) {
  const path = `m/44'/0'/0'/0/${index}`;
  const node = root.derivePath(path);

  const { address } = bitcoinjs.payments.p2pkh({
    pubkey: node.publicKey
  });

  const card = createCard("Bitcoin (BTC)");
  card.innerHTML += `<div class="value">${address}</div>`;

  if (show) {
    card.innerHTML += `<div class="value">私钥: ${node.toWIF()}</div>`;
  }

  cardsEl.appendChild(card);
}

function generateETH(seed, show) {
  const wallet = ethers.Wallet.fromMnemonic(
    bip39.entropyToMnemonic(seed.slice(0, 16))
  );

  const card = createCard("Ethereum / USDT (ERC20)");
  card.innerHTML += `<div class="value">${wallet.address}</div>`;

  if (show) {
    card.innerHTML += `<div class="value">私钥: ${wallet.privateKey}</div>`;
  }

  cardsEl.appendChild(card);
}

function generateTRON(seed, show) {
  const ethWallet = ethers.Wallet.fromMnemonic(
    bip39.entropyToMnemonic(seed.slice(0, 16))
  );

  const tronWeb = new TronWeb({ fullHost: "https://api.trongrid.io" });
  const tronAddr = tronWeb.address.fromPrivateKey(
    ethWallet.privateKey.replace("0x", "")
  );

  const card = createCard("TRON / USDT (TRC20)");
  card.innerHTML += `<div class="value">${tronAddr}</div>`;

  if (show) {
    card.innerHTML += `<div class="value">私钥: ${ethWallet.privateKey}</div>`;
  }

  cardsEl.appendChild(card);
}

function createCard(title) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `<h3>${title}</h3>`;
  return div;
}
