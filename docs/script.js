// Global variables
let allCommands = [];
const searchInput = document.getElementById('searchInput');
const commandsGrid = document.getElementById('commandsGrid');
const noResults = document.getElementById('noResults');
const commandCount = document.getElementById('commandCount');
const loading = document.getElementById('loading');

// Load commands from JSON file
async function loadCommands() {
    try {
        const response = await fetch('commands.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allCommands = data.commands || data; // Handle both {commands: [...]} and [...] formats
        renderCommands(allCommands);
        updateStats();
        loading.style.display = 'none';
        commandsGrid.style.display = 'grid';
    } catch (error) {
        console.error('Error loading commands:', error);
        loading.innerHTML = `
                    <div class="error">
                        <h3>Error Loading Commands</h3>
                        <p>Could not load commands.json. Please ensure the file exists in the same directory.</p>
                        <p><strong>Expected format:</strong></p>
                        <pre style="text-align: left; margin-top: 10px; color: #00ff41;">{
  "commands": [
    {
      "command": "ls",
      "description": "List directory contents",
      "url": "https://example.com/ls-cheatsheet"
    }
  ]
}</pre>
                        <p style="margin-top: 15px; font-size: 0.9em;">Error: ${error.message}</p>
                    </div>
                `;
    }
}

// Render commands to the grid
function renderCommands(commands) {
    commandsGrid.innerHTML = '';
    commands.forEach(cmd => {
        const card = document.createElement('div');
        card.className = 'command-card';
        card.setAttribute('data-command', cmd.command);

        card.innerHTML = `
                    <h3 class="command-name">${escapeHtml(cmd.command)}</h3>
                    <p class="command-description">${escapeHtml(cmd.description)}</p>
                    <a href="${escapeHtml(cmd.url)}" class="command-link" target="_blank" rel="noopener">View Cheatsheet</a>
                `;

        commandsGrid.appendChild(card);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStats() {
    const visibleCommands = document.querySelectorAll('.command-card:not([style*="display: none"])').length;
    commandCount.textContent = visibleCommands;
}

// Search functionality
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    const commandCards = document.querySelectorAll('.command-card');
    commandCards.forEach(card => {
        const commandName = card.dataset.command.toLowerCase();
        const description = card.querySelector('.command-description').textContent.toLowerCase();

        if (commandName.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (visibleCount === 0 && searchTerm !== '') {
        noResults.style.display = 'block';
        commandsGrid.style.display = 'none';
    } else {
        noResults.style.display = 'none';
        commandsGrid.style.display = 'grid';
    }

    updateStats();
}

// Event listeners
searchInput.addEventListener('input', performSearch);

// Add some terminal-like interactions
document.addEventListener('keydown', function (e) {
    // Focus search on '/' key
    if (e.key === '/' && e.target !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }

    // Clear search on Escape
    if (e.key === 'Escape' && e.target === searchInput) {
        searchInput.value = '';
        performSearch();
        searchInput.blur();
    }
});

// Add loading effect for dynamically loaded cards
function animateCards() {
    const cards = document.querySelectorAll('.command-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    loadCommands().then(() => {
        setTimeout(animateCards, 100);
    });
});