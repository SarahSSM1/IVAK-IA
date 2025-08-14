// ===== Tema Escuro =====
const themeToggleButton = document.getElementById("theme-toggle-button");
const body = document.body;
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") body.classList.add("dark-theme");

themeToggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  localStorage.setItem("theme", body.classList.contains("dark-theme") ? "dark" : "light");
});

// ===== Elementos =====
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatOutput = document.getElementById("chat-output");
const chatOutputContainer = document.getElementById("chat-output-container");
const lastQuestion = document.getElementById("last-question");
const apiKeyInput = document.getElementById("api-key");
const sendButton = document.getElementById("send-button");
const copyButton = document.getElementById("copy-button");
const clearButton = document.getElementById("clear-button");
const charCounter = document.getElementById("char-counter");
const modelSelect = document.getElementById("model-select"); // novo

// ===== Carregar dados salvos =====
const savedApiKey = localStorage.getItem("gemini-api-key");
if (savedApiKey) apiKeyInput.value = savedApiKey;

const savedModel = localStorage.getItem("gemini-model") || "gemini-1.5-flash-latest";
modelSelect.value = savedModel;

// Salvar API key
apiKeyInput.addEventListener("input", () => {
  localStorage.setItem("gemini-api-key", apiKeyInput.value.trim());
});

// Salvar modelo escolhido
modelSelect.addEventListener("change", () => {
  localStorage.setItem("gemini-model", modelSelect.value);
});

// ===== Contador de caracteres =====
userInput.addEventListener("input", () => {
  charCounter.textContent = `${userInput.value.length} caracteres`;
});

// ===== Função para adicionar mensagens =====
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("chat-message", sender);
  msg.textContent = text;
  chatOutput.appendChild(msg);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// ===== Enviar pergunta =====
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pergunta = userInput.value.trim();
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;

  if (!apiKey) return alert("Insira sua chave da API Gemini.");
  if (!pergunta) return;

  lastQuestion.textContent = pergunta;
  chatOutput.innerHTML = "";
  chatOutputContainer.style.display = "block";
  addMessage("user", pergunta);
  userInput.value = "";
  charCounter.textContent = "0 caracteres";
  sendButton.disabled = true;

  const loadingMsg = document.createElement("div");
  loadingMsg.classList.add("chat-message", "ivak");
  loadingMsg.textContent = "Digitando...";
  chatOutput.appendChild(loadingMsg);

  try {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: pergunta }] }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Erro na API");
    }

    const data = await response.json();
    loadingMsg.remove();

    const resposta = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta";
    addMessage("ivak", resposta);

  } catch (err) {
    loadingMsg.remove();
    addMessage("ivak", "Erro: " + err.message);
  } finally {
    sendButton.disabled = false;
  }
});

// ===== Botão Copiar =====
copyButton.addEventListener("click", async () => {
  const textToCopy = chatOutput.textContent.trim();
  if (!textToCopy) return alert("Nenhuma resposta para copiar.");

  try {
    await navigator.clipboard.writeText(textToCopy);
    copyButton.textContent = "✅ Copiado!";
    setTimeout(() => copyButton.textContent = "📋 Copiar", 2000);
  } catch {
    alert("Não foi possível copiar para a área de transferência.");
  }
});

// ===== Botão Limpar =====
clearButton.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja limpar a resposta?")) {
    chatOutput.innerHTML = "";
    lastQuestion.textContent = "";
    chatOutputContainer.style.display = "none";
    userInput.value = "";
    charCounter.textContent = "0 caracteres";
  }
});