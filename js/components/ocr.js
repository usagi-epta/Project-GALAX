/**
 * OCR Component
 * Handles text extraction from images and PDFs using tesseract.js and scribe.js
 */

class OCRManager {
    constructor() {
        this.tesseractWorker = null;
        this.scribeInstance = null;
        this.isInitialized = false;
        this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
        this.supportedPdfTypes = ['application/pdf'];
        
        this.initialize();
    }

    async initialize() {
        if (!CONFIG.features.ocr) {
            console.warn('OCR feature is disabled');
            return;
        }

        try {
            await this.loadLibraries();
            await this.initializeTesseract();
            await this.initializeScribe();
            this.isInitialized = true;
            console.log('OCR Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OCR Manager:', error);
        }
    }

    async loadLibraries() {
        const promises = [];

        if (CONFIG.ocr.tesseract.enabled && !window.Tesseract) {
            promises.push(this.loadScript(CONFIG.ocr.tesseract.localPath));
        }

        if (CONFIG.ocr.scribe.enabled && CONFIG.features.pdfOcr && !window.Scribe) {
            promises.push(this.loadScript(CONFIG.ocr.scribe.localPath));
        }

        await Promise.all(promises);
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initializeTesseract() {
        if (!CONFIG.ocr.tesseract.enabled || !window.Tesseract) return;

        try {
            this.tesseractWorker = await window.Tesseract.createWorker(CONFIG.ocr.tesseract.workerOptions);
            await this.tesseractWorker.loadLanguage('eng');
            await this.tesseractWorker.initialize('eng');
            console.log('Tesseract.js initialized');
        } catch (error) {
            console.error('Failed to initialize Tesseract:', error);
        }
    }

    async initializeScribe() {
        if (!CONFIG.ocr.scribe.enabled || !CONFIG.features.pdfOcr || !window.Scribe) return;

        try {
            this.scribeInstance = new window.Scribe({
                workerPath: CONFIG.ocr.scribe.workerPath,
                fontsPath: CONFIG.ocr.scribe.fontsPath,
                tesseractPath: CONFIG.ocr.scribe.tesseractPath
            });
            console.log('Scribe.js initialized');
        } catch (error) {
            console.error('Failed to initialize Scribe:', error);
        }
    }

    async processFile(file) {
        if (!this.isInitialized) {
            throw new Error('OCR Manager not initialized');
        }

        if (this.supportedImageTypes.includes(file.type)) {
            return await this.processImageFile(file);
        } else if (this.supportedPdfTypes.includes(file.type)) {
            return await this.processPdfFile(file);
        } else {
            throw new Error(`Unsupported file type: ${file.type}`);
        }
    }

    async processImageFile(file) {
        if (!this.tesseractWorker) {
            throw new Error('Tesseract worker not initialized');
        }

        try {
            const result = await this.tesseractWorker.recognize(file);
            return {
                text: result.data.text,
                confidence: result.data.confidence,
                words: result.data.words,
                lines: result.data.lines,
                paragraphs: result.data.paragraphs,
                type: 'image'
            };
        } catch (error) {
            console.error('Error processing image file:', error);
            throw error;
        }
    }

    async processPdfFile(file) {
        if (!this.scribeInstance) {
            throw new Error('Scribe instance not initialized');
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await this.scribeInstance.extractText(arrayBuffer);
            
            return {
                text: result.text,
                pages: result.pages,
                metadata: result.metadata,
                type: 'pdf'
            };
        } catch (error) {
            console.error('Error processing PDF file:', error);
            throw error;
        }
    }

    async setLanguage(language) {
        if (!this.tesseractWorker) {
            throw new Error('Tesseract worker not initialized');
        }

        if (!CONFIG.ocr.tesseract.languages.includes(language)) {
            throw new Error(`Language ${language} not supported`);
        }

        try {
            await this.tesseractWorker.loadLanguage(language);
            await this.tesseractWorker.initialize(language);
            console.log(`Tesseract language set to: ${language}`);
        } catch (error) {
            console.error('Error setting language:', error);
            throw error;
        }
    }

    getSupportedLanguages() {
        return CONFIG.ocr.tesseract.languages;
    }

    isSupportedFile(file) {
        return this.supportedImageTypes.includes(file.type) || 
               this.supportedPdfTypes.includes(file.type);
    }

    async terminate() {
        if (this.tesseractWorker) {
            await this.tesseractWorker.terminate();
            this.tesseractWorker = null;
        }

        if (this.scribeInstance) {
            this.scribeInstance.terminate();
            this.scribeInstance = null;
        }

        this.isInitialized = false;
        console.log('OCR Manager terminated');
    }

    getProgress() {
        return {
            tesseract: this.tesseractWorker ? 'ready' : 'not_initialized',
            scribe: this.scribeInstance ? 'ready' : 'not_initialized',
            initialized: this.isInitialized
        };
    }
}

window.OCRManager = new OCRManager();