// Tema escuro
const themeToggleButton = document.getElementById("theme-toggle-button");
const body = document.body;
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") body.classList.add("dark-theme");

themeToggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  localStorage.setItem("theme", body.classList.contains("dark-theme") ? "dark" : "light");
});

// Elementos do chat
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatOutput = document.getElementById("chat-output");
const apiKeyInput = document.getElementById("api-key");
const sendButton = document.getElementById("send-button");

// Carrega chave salva
const savedApiKey = localStorage.getItem("gemini-api-key");
if (savedApiKey) apiKeyInput.value = savedApiKey;

apiKeyInput.addEventListener("input", () => {
  localStorage.setItem("gemini-api-key", apiKeyInput.value.trim());
});

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("chat-message", sender);
  msg.textContent = text;
  chatOutput.appendChild(msg);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Envia pergunta
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pergunta = userInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) return alert("Insira sua chave da API Gemini.");
  if (!pergunta) return;

  addMessage("user", pergunta);
  userInput.value = "";
  sendButton.disabled = true;

  const loadingMsg = document.createElement("div");
  loadingMsg.classList.add("chat-message", "ivak");
  loadingMsg.textContent = "Digitando...";
  chatOutput.appendChild(loadingMsg);

  try {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
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