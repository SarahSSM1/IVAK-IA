//Tema escuro
const themeToggleButton = document.getElementById('theme-toggle-button');
const body = document.body;

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

