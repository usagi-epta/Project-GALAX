/**

- File Management Component
- Handles file uploads, attachments, and media processing
  */

class FileManager {
constructor() {
this.allowedTypes = [
‘image/jpeg’, ‘image/png’, ‘image/gif’, ‘image/webp’,
‘video/mp4’, ‘video/webm’, ‘application/pdf’,
‘application/msword’, ‘application/vnd.openxmlformats-officedocument.wordprocessingml.document’
];
this.maxFileSize = 10 * 1024 * 1024; // 10MB

```
    this.bindEventHandlers();
}

bindEventHandlers() {
    this.attach = this.attach.bind(this);
}

attach() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = this.allowedTypes.join(',');
    
    input.onchange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => this.processFile(file));
    };
    
    input.click();
}

processFile(file) {
    if (!this.validateFile(file)) return;
    
    if (file.type.startsWith('image/')) {
        this.handleImageFile(file);
    } else if (file.type.startsWith('video/')) {
        this.handleVideoFile(file);
    } else {
        this.handleDocumentFile(file);
    }
}

validateFile(file) {
    if (file.size > this.maxFileSize) {
        this.showError(`File too large: ${file.name}. Maximum size is 10MB.`);
        return false;
    }
    
    if (!this.allowedTypes.includes(file.type)) {
        this.showError(`File type not supported: ${file.type}`);
        return false;
    }
    
    return true;
}

handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        this.addFileMessage(file.name, e.target.result, 'image');
    };
    reader.readAsDataURL(file);
}

handleVideoFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        this.addFileMessage(file.name, e.target.result, 'video');
    };
    reader.readAsDataURL(file);
}

handleDocumentFile(file) {
    this.addFileMessage(file.name, null, 'document');
}

addFileMessage(fileName, dataUrl, type) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const fileSize = this.formatFileSize(dataUrl ? dataUrl.length : 0);
    const fileIcon = this.getFileIcon(type);
    
    let content = '';
    if (type === 'image' && dataUrl) {
        content = `
            <div class="file-preview">
                <img src="${dataUrl}" alt="${fileName}" style="max-width: 200px; border-radius: 8px;">
                <div style="margin-top: 5px; font-size: 12px; color: #666;">${fileName}</div>
            </div>
        `;
    } else if (type === 'video' && dataUrl) {
        content = `
            <div class="file-preview">
                <video controls style="max-width: 200px; border-radius: 8px;">
                    <source src="${dataUrl}" type="video/mp4">
                </video>
                <div style="margin-top: 5px; font-size: 12px; color: #666;">${fileName}</div>
            </div>
        `;
    } else {
        content = `
            <div class="file-preview">
                <span class="file-icon">${fileIcon}</span>
                <div style="display: inline-block;">
                    <div style="font-weight: bold;">${fileName}</div>
                    <div style="font-size: 12px; color: #666;">${fileSize}</div>
                </div>
            </div>
        `;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message own';
    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${content}
            <div class="message-status">✓</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

getFileIcon(type) {
    switch (type) {
        case 'image': return '🖼️';
        case 'video': return '🎥';
        case 'document': return '📄';
        default: return '📎';
    }
}

formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #ff4757;
        color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}
```

}

const fileManager = new FileManager();

window.Files = {
attach: fileManager.attach
};

if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { FileManager, fileManager };
} else if (typeof window !== ‘undefined’) {
window.FileManager = FileManager;
window.fileManager = fileManager;
}
