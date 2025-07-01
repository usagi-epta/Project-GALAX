/**

- Voice and Call Management Component
  */

class VoiceManager {
constructor() {
this.isRecording = false;
this.mediaRecorder = null;
this.recordingTimeout = null;
this.recordingChunks = [];

```
    this.bindEventHandlers();
}

bindEventHandlers() {
    this.startCall = this.startCall.bind(this);
    this.startVideoCall = this.startVideoCall.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
}

startCall() {
    console.log('Starting voice call...');
    this.showCallInterface('voice');
}

startVideoCall() {
    console.log('Starting video call...');
    this.showCallInterface('video');
}

toggleRecording() {
    if (!this.isRecording) {
        this.startRecording();
    } else {
        this.stopRecording();
    }
}

async startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordingChunks = [];
        
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordingChunks.push(event.data);
            }
        };
        
        this.mediaRecorder.onstop = () => {
            this.processRecording();
        };
        
        this.mediaRecorder.start();
        this.isRecording = true;
        this.updateRecordingUI(true);
        
        // Auto-stop after 30 seconds
        this.recordingTimeout = setTimeout(() => {
            this.stopRecording();
        }, 30000);
        
    } catch (error) {
        console.error('Failed to start recording:', error);
        this.simulateVoiceRecording();
    }
}

stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    this.isRecording = false;
    this.updateRecordingUI(false);
    clearTimeout(this.recordingTimeout);
}

simulateVoiceRecording() {
    this.isRecording = true;
    this.updateRecordingUI(true);
    
    setTimeout(() => {
        this.isRecording = false;
        this.updateRecordingUI(false);
        this.addVoiceMessage(Math.floor(Math.random() * 25) + 5);
    }, 2000);
}

updateRecordingUI(recording) {
    const btn = document.getElementById('voiceBtn');
    if (btn) {
        btn.classList.toggle('recording', recording);
        btn.innerHTML = recording ? '⏹️' : '🎤';
    }
    
    if (recording) {
        this.showRecordingIndicator();
    } else {
        this.hideRecordingIndicator();
    }
}

showRecordingIndicator() {
    const input = document.querySelector('.message-input');
    if (!input || document.getElementById('recordingIndicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'recordingIndicator';
    indicator.className = 'recording-indicator';
    indicator.innerHTML = `
        <span>🎤 Recording...</span>
        <div class="recording-wave"></div>
        <div class="recording-wave"></div>
        <div class="recording-wave"></div>
    `;
    input.insertBefore(indicator, input.firstChild);
}

hideRecordingIndicator() {
    const indicator = document.getElementById('recordingIndicator');
    if (indicator) indicator.remove();
}

processRecording() {
    if (this.recordingChunks.length > 0) {
        const blob = new Blob(this.recordingChunks, { type: 'audio/webm' });
        const duration = Math.floor(Math.random() * 25) + 5;
        this.addVoiceMessage(duration, blob);
    }
}

addVoiceMessage(duration, blob = null) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message own';
    messageDiv.innerHTML = `
        <div class="message-bubble">
            🎤 Voice message (${duration}s)
            <div style="margin-top: 8px; display: flex; align-items: center; gap: 10px;">
                <button onclick="this.innerHTML = this.innerHTML === '▶️' ? '⏸️' : '▶️'" 
                        style="background: none; border: none; font-size: 20px; cursor: pointer;">▶️</button>
                <div style="flex: 1; height: 3px; background: #ddd; border-radius: 2px; position: relative;">
                    <div style="width: 0%; height: 100%; background: #4ecdc4; border-radius: 2px;"></div>
                </div>
                <span style="font-size: 12px;">${duration}s</span>
            </div>
            <div class="message-status">✓</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

showCallInterface(type) {
    const callModal = document.createElement('div');
    callModal.className = 'call-modal';
    callModal.innerHTML = `
        <div class="call-content">
            <div class="call-header">
                <h3>${type === 'video' ? 'Video' : 'Voice'} Call</h3>
                <div class="call-status">Connecting...</div>
            </div>
            <div class="call-avatar">
                <div class="chat-avatar">DJ</div>
            </div>
            <div class="call-actions">
                <button class="call-btn end-call" onclick="this.closest('.call-modal').remove()">
                    📞
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(callModal);
    
    // Simulate call connection
    setTimeout(() => {
        const status = callModal.querySelector('.call-status');
        if (status) status.textContent = 'Connected';
    }, 2000);
}

getStatus() {
    return {
        isRecording: this.isRecording,
        hasMediaRecorder: !!this.mediaRecorder
    };
}
```

}

const voiceManager = new VoiceManager();

window.Voice = {
startCall: voiceManager.startCall,
startVideoCall: voiceManager.startVideoCall,
toggleRecording: voiceManager.toggleRecording
};

if (typeof module !== ‘undefined’ && module.exports) {
module.exports = { VoiceManager, voiceManager };
} else if (typeof window !== ‘undefined’) {
window.VoiceManager = VoiceManager;
window.voiceManager = voiceManager;
}
