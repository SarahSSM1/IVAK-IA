// Tema Escuro 
const themeToggleButton = document.getElementById("theme-toggle-button");
const body = document.body;
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") body.classList.add("dark-theme");

themeToggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  localStorage.setItem("theme", body.classList.contains("dark-theme") ? "dark" : "light");
});



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


// Carregar e salvar chave API
const savedApiKey = localStorage.getItem("gemini-api-key");
if (savedApiKey) apiKeyInput.value = savedApiKey;

apiKeyInput.addEventListener("input", () => {
  localStorage.setItem("gemini-api-key", apiKeyInput.value.trim());
});


// Contador de caracteres
userInput.addEventListener("input", () => {
  charCounter.textContent = `${userInput.value.length} caracteres`;
});


// Função para adicionar mensagens
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("chat-message", sender);
  msg.textContent = text;
  chatOutput.appendChild(msg);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}


// Enviar pergunta
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pergunta = userInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) return alert("Insira sua chave da API Gemini.");
  if (!pergunta) return;

  // Exibir pergunta junto com resposta
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

// Botão Copiar Resposta
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

// Botão Limpar Resposta
clearButton.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja limpar a resposta?")) {
    chatOutput.innerHTML = "";
    lastQuestion.textContent = "";
    chatOutputContainer.style.display = "none";
    userInput.value = "";
    charCounter.textContent = "0 caracteres";
  }
});