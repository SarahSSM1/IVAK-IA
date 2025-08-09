document.addEventListener('DOMContentLoaded', () => {


    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatOutput = document.getElementById('chat-output');
    const apiKeyInput = document.getElementById('api-key');
    const sendButton = document.getElementById('send-button');
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=`;

    
    const toggleTheme = () => {
        body.classList.toggle('dark-theme');
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    let conversationHistory = []; 
    
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
    
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userQuestion = userInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            alert('Por favor, insira sua chave da API da Gemini.');
            return;
        }

        if (!userQuestion) {
            alert('Por favor, digite sua pergunta.');
            return;
        }

        addMessageToChat('user', userQuestion);
        userInput.value = '';
        sendButton.disabled = true;

        const loadingMessage = addMessageToChat('ivak', 'Digitando...');

        try {
            const aiResponse = await getGeminiResponse(userQuestion, apiKey);
            
            removeMessage(loadingMessage);
            addMessageToChat('ivak', aiResponse);

        } catch (error) {
            console.error('Erro na comunicação com a API da Gemini:', error);
            removeMessage(loadingMessage);
            addMessageToChat('ivak', 'Desculpe, ocorreu um erro. Tente novamente mais tarde.');
        } finally {
            sendButton.disabled = false;
        }
    });

    apiKeyInput.addEventListener('input', () => {
        localStorage.setItem('gemini-api-key', apiKeyInput.value.trim());
    });

    function addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);
        messageDiv.textContent = message;
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
        return messageDiv;
    }

    function removeMessage(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    async function getGeminiResponse(prompt, apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `Olá! Esta é uma resposta de teste mockada para a sua pergunta: "${prompt}".`;

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Erro ao obter resposta da API.');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
});

