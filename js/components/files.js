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
this.ocrEnabled = CONFIG.features.ocr;
this.pdfOcrEnabled = CONFIG.features.pdfOcr;

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
        
        // Process OCR if enabled
        if (this.ocrEnabled && window.OCRManager && window.OCRManager.isSupportedFile(file)) {
            this.processOCR(file, 'image');
        }
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
    
    // Process PDF OCR if enabled
    if (this.pdfOcrEnabled && file.type === 'application/pdf' && window.OCRManager && window.OCRManager.isSupportedFile(file)) {
        this.processOCR(file, 'pdf');
    }
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

async processOCR(file, type) {
    if (!window.OCRManager) {
        console.warn('OCR Manager not available');
        return;
    }

    try {
        this.showOCRProgress(file.name, 'Processing...');
        
        const result = await window.OCRManager.processFile(file);
        
        if (result && result.text) {
            this.addOCRMessage(file.name, result, type);
            this.hideOCRProgress(file.name);
        } else {
            this.showError('OCR processing failed - no text found');
            this.hideOCRProgress(file.name);
        }
    } catch (error) {
        console.error('OCR processing error:', error);
        this.showError(`OCR processing failed: ${error.message}`);
        this.hideOCRProgress(file.name);
    }
}

showOCRProgress(fileName, status) {
    const progressDiv = document.createElement('div');
    progressDiv.id = `ocr-progress-${fileName.replace(/[^a-zA-Z0-9]/g, '')}`;
    progressDiv.style.cssText = `
        position: fixed; top: 60px; right: 20px; background: #4ecdc4;
        color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000;
        display: flex; align-items: center; gap: 10px;
    `;
    progressDiv.innerHTML = `
        <div class="spinner" style="width: 16px; height: 16px; border: 2px solid #fff; 
             border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>OCR ${status} for ${fileName}</span>
    `;
    document.body.appendChild(progressDiv);
    
    // Add CSS animation if not already present
    if (!document.querySelector('#ocr-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'ocr-spinner-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

hideOCRProgress(fileName) {
    const progressDiv = document.getElementById(`ocr-progress-${fileName.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (progressDiv) {
        progressDiv.remove();
    }
}

addOCRMessage(fileName, ocrResult, type) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const confidence = ocrResult.confidence ? Math.round(ocrResult.confidence) : 'N/A';
    const wordCount = ocrResult.text.split(/\s+/).length;
    
    const content = `
        <div class="ocr-result">
            <div class="ocr-header">
                <span class="ocr-icon">🔍</span>
                <strong>OCR Results: ${fileName}</strong>
                <span class="ocr-stats">(${wordCount} words, ${confidence}% confidence)</span>
            </div>
            <div class="ocr-text" style="
                background: #f8f9fa; padding: 10px; border-radius: 5px; 
                margin: 10px 0; max-height: 200px; overflow-y: auto;
                font-family: monospace; font-size: 12px; line-height: 1.4;
            ">${ocrResult.text}</div>
            <div class="ocr-actions">
                <button onclick="navigator.clipboard.writeText('${ocrResult.text.replace(/'/g, "\\'")}'); this.textContent='Copied!';" 
                        style="background: #4ecdc4; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    Copy Text
                </button>
            </div>
        </div>
    `;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${content}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
