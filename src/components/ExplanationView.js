import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Loader2, Volume2 } from 'lucide-react';

// --- Helper functions for audio processing ---
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function pcmToWav(pcmData, sampleRate) {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.byteLength, true);
    return new Blob([header, pcmData], { type: 'audio/wav' });
}

export default function ExplanationView({ explanationText, generateAudioForText }) {
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const audioPlayerRef = useRef(null);

    const handleListenClick = async () => {
        setIsAudioLoading(true);
        setAudioUrl(null);
        const cleanText = explanationText.replace(/\*\*|#|\*/g, '');
        const audioData = await generateAudioForText(cleanText);

        if (audioData) {
            const pcmData = base64ToArrayBuffer(audioData.data);
            const sampleRate = parseInt(audioData.mimeType.match(/rate=(\d+)/)[1], 10);
            const wavBlob = pcmToWav(new Int16Array(pcmData), sampleRate);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);
        } else {
            alert("Failed to generate audio.");
        }
        setIsAudioLoading(false);
    };
    
    useEffect(() => {
        if (audioUrl && audioPlayerRef.current) {
            const player = audioPlayerRef.current;
            const onLoadedMetadata = () => {
                animateTextHighlighting(player.duration);
                player.play();
            };
            player.addEventListener('loadedmetadata', onLoadedMetadata);
            return () => player.removeEventListener('loadedmetadata', onLoadedMetadata);
        }
    }, [audioUrl]);

    const animateTextHighlighting = (duration) => {
        const sentences = document.querySelectorAll('.sentence');
        if (sentences.length === 0) return;
        const durationPerSentence = (duration * 1000) / sentences.length;
        let currentSentence = 0;
        const highlightNext = () => {
            if (currentSentence > 0 && sentences[currentSentence - 1]) {
                 sentences[currentSentence - 1].classList.remove('highlight');
            }
            if (currentSentence < sentences.length) {
                sentences[currentSentence].classList.add('highlight');
                currentSentence++;
                setTimeout(highlightNext, durationPerSentence);
            }
        };
        highlightNext();
    };

    const formattedExplanation = explanationText
        .split('\n').map(line => {
            if (line.trim() === '') return '<br />';
            return line.match(/[^.!?]+[.!?]*/g)?.map(sentence => `<span class="sentence">${sentence}</span>`).join('') || `<span class="sentence">${line}</span>`;
        }).join('')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-3 text-shadow-lg">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-5 mb-2 border-b border-white/20 pb-1">$1</h2>');

    return (
        <div className="p-6 overflow-y-auto text-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold flex items-center gap-2"><BookOpen /> Detailed Explanation</h2>
                <button onClick={handleListenClick} disabled={isAudioLoading} className="flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-500">
                    {isAudioLoading ? <Loader2 className="animate-spin" /> : <Volume2 />}
                    Listen & Watch
                </button>
            </div>
            {audioUrl && (
                <div className="my-4">
                    <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full"></audio>
                </div>
            )}
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedExplanation }} />
            <style jsx>{`
                .highlight { background-color: rgba(236, 72, 153, 0.3); transition: background-color 0.2s ease-in-out; border-radius: 4px; }
                .text-shadow-lg { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }
            `}</style>
        </div>
    );
};
