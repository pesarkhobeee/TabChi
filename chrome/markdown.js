// Markdown parser for note section
// Using marked.js library - a markdown parser and compiler

// MarkedJS implementation
(function() {
    // Markdown parser library
    const marked = (function(){
        // Simple implementation of marked.js functionality
        function parse(text) {
            if (!text) return '';
            
            // Convert headers
            text = text.replace(/^(#{1,6})\s+(.*?)$/gm, function(match, hashes, content) {
                const level = hashes.length;
                return `<h${level}>${content.trim()}</h${level}>`;
            });
            
            // Convert bold
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
            
            // Convert italic
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            text = text.replace(/_(.*?)_/g, '<em>$1</em>');
            
            // Convert links
            text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
            
            // Convert unordered lists
            text = text.replace(/^\s*[-*+]\s+(.*?)$/gm, '<li>$1</li>');
            text = text.replace(/(<li>.*?<\/li>(\n|$))+/g, '<ul>$&</ul>');
            
            // Convert ordered lists
            text = text.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li>$2</li>');
            text = text.replace(/(<li>.*?<\/li>(\n|$))+/g, '<ol>$&</ol>');
            
            // Convert code blocks
            text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            
            // Convert inline code
            text = text.replace(/`(.*?)`/g, '<code>$1</code>');
            
            // Convert blockquotes
            text = text.replace(/^>\s+(.*?)$/gm, '<blockquote>$1</blockquote>');
            
            // Convert horizontal rules
            text = text.replace(/^-{3,}|^_{3,}|^\*{3,}$/gm, '<hr>');
            
            // Convert paragraphs
            text = text.replace(/^(?!<[a-z])(.*?)$/gm, function(match) {
                if (match.trim() === '') return '';
                return `<p>${match}</p>`;
            });
            
            return text;
        }
        
        return { parse };
    })();
    
    // Expose to global scope
    window.marked = marked;
})();

// Initialize markdown for notes
document.addEventListener('DOMContentLoaded', function() {
    initMarkdownNotes();
});

function initMarkdownNotes() {
    const notesTextarea = document.getElementById('notes-textarea');
    const notesPreview = document.getElementById('notes-preview');
    const notesContainer = document.getElementById('notes-container');
    
    // Create toggle button for preview mode
    const notesHeader = document.querySelector('.notes-header');
    
    // Add minimize button
    const minimizeButton = document.createElement('button');
    minimizeButton.id = 'notes-minimize-toggle';
    minimizeButton.className = 'icon-button';
    minimizeButton.title = 'Minimize/Expand Notes';
    minimizeButton.innerHTML = `
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 9H20M4 15H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    // Add markdown preview button
    const previewButton = document.createElement('button');
    previewButton.id = 'notes-preview-toggle';
    previewButton.className = 'icon-button';
    previewButton.title = 'Toggle Markdown Preview';
    previewButton.innerHTML = `
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6L4 18H20L12 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    notesHeader.insertBefore(minimizeButton, notesHeader.firstChild);
    notesHeader.insertBefore(previewButton, notesHeader.firstChild);
    
    // Set up event listeners
    previewButton.addEventListener('click', toggleMarkdownPreview);
    minimizeButton.addEventListener('click', toggleMinimizeNotes);
    notesTextarea.addEventListener('input', updateMarkdownPreview);
    
    // Load the saved states
    chrome.storage.local.get(['markdownPreviewActive', 'notesMinimized'], function(result) {
        // Apply minimized state if saved
        if (result.notesMinimized) {
            notesContainer.classList.add('notes-minimized');
            minimizeButton.innerHTML = `
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5L5 19M5 5L19 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            minimizeButton.title = 'Expand Notes';
        }
        
        // Apply preview state if saved
        if (result.markdownPreviewActive && !result.notesMinimized) {
            // Show preview mode
            updateMarkdownPreview();
            notesTextarea.style.display = 'none';
            notesPreview.style.display = 'block';
            previewButton.title = 'Edit Markdown';
            previewButton.innerHTML = `
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12M9 15H12L20.5 6.5C21.3284 5.67157 21.3284 4.32843 20.5 3.5C19.6716 2.67157 18.3284 2.67157 17.5 3.5L9 12V15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        } else if (!result.notesMinimized) {
            // Show edit mode (default)
            notesPreview.style.display = 'none';
        }
    });
}

// Toggle between minimized and expanded notes
function toggleMinimizeNotes() {
    const notesContainer = document.getElementById('notes-container');
    const minimizeButton = document.getElementById('notes-minimize-toggle');
    const isMinimized = notesContainer.classList.toggle('notes-minimized');
    
    // Update button appearance
    if (isMinimized) {
        minimizeButton.innerHTML = `
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 5L5 19M5 5L19 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        minimizeButton.title = 'Expand Notes';
    } else {
        minimizeButton.innerHTML = `
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 9H20M4 15H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        minimizeButton.title = 'Minimize Notes';
    }
    
    // Save state
    chrome.storage.local.set({ notesMinimized: isMinimized });
    
    // Sync with other tabs
    syncMinimizeState(isMinimized);
}

// Sync minimize state across tabs
function syncMinimizeState(isMinimized) {
    chrome.tabs.query({url: "chrome://newtab/"}, function(tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, { 
                action: "updateNotesMinimized", 
                isMinimized: isMinimized 
            });
        });
    });
}

// Toggle between edit and preview modes
function toggleMarkdownPreview() {
    const notesTextarea = document.getElementById('notes-textarea');
    const notesPreview = document.getElementById('notes-preview');
    const previewButton = document.getElementById('notes-preview-toggle');
    
    if (notesPreview.style.display === 'none') {
        // Show preview
        updateMarkdownPreview();
        notesTextarea.style.display = 'none';
        notesPreview.style.display = 'block';
        previewButton.title = 'Edit Markdown';
        previewButton.innerHTML = `
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12M9 15H12L20.5 6.5C21.3284 5.67157 21.3284 4.32843 20.5 3.5C19.6716 2.67157 18.3284 2.67157 17.5 3.5L9 12V15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Save preview state
        chrome.storage.local.set({ markdownPreviewActive: true });
        
        // Sync with other tabs
        syncPreviewMode(true);
    } else {
        // Show editor
        notesTextarea.style.display = 'block';
        notesPreview.style.display = 'none';
        previewButton.title = 'Preview Markdown';
        previewButton.innerHTML = `
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6L4 18H20L12 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Save preview state
        chrome.storage.local.set({ markdownPreviewActive: false });
        
        // Sync with other tabs
        syncPreviewMode(false);
    }
}

// Sync preview mode across tabs
function syncPreviewMode(isPreviewActive) {
    chrome.tabs.query({url: "chrome://newtab/"}, function(tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, { 
                action: "updateMarkdownPreview", 
                isPreviewActive: isPreviewActive 
            });
        });
    });
}

// Update preview content
function updateMarkdownPreview() {
    const notesTextarea = document.getElementById('notes-textarea');
    const notesPreview = document.getElementById('notes-preview');
    
    if (notesTextarea && notesPreview) {
        const markdownText = notesTextarea.value;
        notesPreview.innerHTML = marked.parse(markdownText);
    }
}

// Listen for messages from other tabs
chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === "updateMarkdownPreview") {
        const notesTextarea = document.getElementById('notes-textarea');
        const notesPreview = document.getElementById('notes-preview');
        const previewButton = document.getElementById('notes-preview-toggle');
        
        if (message.isPreviewActive) {
            // Show preview mode
            updateMarkdownPreview();
            notesTextarea.style.display = 'none';
            notesPreview.style.display = 'block';
            previewButton.title = 'Edit Markdown';
            previewButton.innerHTML = `
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12M9 15H12L20.5 6.5C21.3284 5.67157 21.3284 4.32843 20.5 3.5C19.6716 2.67157 18.3284 2.67157 17.5 3.5L9 12V15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        } else {
            // Show edit mode
            notesTextarea.style.display = 'block';
            notesPreview.style.display = 'none';
            previewButton.title = 'Preview Markdown';
            previewButton.innerHTML = `
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6L4 18H20L12 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
    } else if (message.action === "updateNotesMinimized") {
        const notesContainer = document.getElementById('notes-container');
        const minimizeButton = document.getElementById('notes-minimize-toggle');
        
        if (message.isMinimized) {
            notesContainer.classList.add('notes-minimized');
            minimizeButton.innerHTML = `
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5L5 19M5 5L19 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            minimizeButton.title = 'Expand Notes';
        } else {
            notesContainer.classList.remove('notes-minimized');
            minimizeButton.innerHTML = `
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 9H20M4 15H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            minimizeButton.title = 'Minimize Notes';
        }
    }
}); 