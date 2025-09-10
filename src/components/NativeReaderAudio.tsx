"use client"
import React, { useState } from 'react';

interface NativeReaderAudioProps {
    text: string;
    lang?: string;
}

const NativeReaderAudio: React.FC<NativeReaderAudioProps> = ({ text, lang = 'pt-BR' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = () => {
        if ('speechSynthesis' in window) {
            const utterance = new window.SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Seu navegador não suporta leitura de texto.');
        }
    };

    const handleStop = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return (
        <div className="flex items-center gap-3 my-4">
            <button
                onClick={isSpeaking ? handleStop : handleSpeak}
                className={`px-4 py-2 rounded transition-colors font-semibold shadow
                    ${isSpeaking
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
            >
                {isSpeaking ? '⏹ Parar Leitura' : '🔊 Ler Texto'}
            </button>
            {isSpeaking && (
                <span className="animate-pulse text-green-600 font-medium">
                    Lendo...
                </span>
            )}
        </div>
    );
};

export default NativeReaderAudio;