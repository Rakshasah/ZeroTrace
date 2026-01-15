import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import { importPublicKey, deriveSharedSecret, encryptMessage, decryptMessage } from '../utils/crypto';

interface ChatWindowProps {
    selectedUser: any;
    currentUser: any;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, currentUser }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');

    // TTL State
    const [ttlMode, setTtlMode] = useState<string>('never');
    const [customTtl, setCustomTtl] = useState<string>('5'); // Default 5 mins

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [sharedSecret, setSharedSecret] = useState<CryptoKey | null>(null);
    const [decryptedCache, setDecryptedCache] = useState<{ [id: string]: string }>({});
    const [handshakeStatus, setHandshakeStatus] = useState<'secure' | 'failed' | 'pending'>('pending');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const performHandshake = async () => {
        if (!selectedUser) return;
        setHandshakeStatus('pending');
        try {
            const res = await fetch(`http://localhost:3000/auth/keys/${selectedUser.id}`);
            const data = await res.json();

            if (!data.publicKey) throw new Error("No public key");

            const importedPublic = await importPublicKey(data.publicKey);
            const myPrivate = (window as any).sessionPrivateKey;
            if (!myPrivate) throw new Error("No session private key");

            const secret = await deriveSharedSecret(myPrivate, importedPublic);
            setSharedSecret(secret);
            setDecryptedCache({});
            setHandshakeStatus('secure');
        } catch (e) {
            console.error("Handshake failed:", e);
            setHandshakeStatus('failed');
        }
    };

    useEffect(() => {
        performHandshake();
    }, [selectedUser]);

    useEffect(() => {
        if (!selectedUser) return;

        fetch(`http://localhost:3000/auth/messages?currentUserId=${currentUser.id}&targetUserId=${selectedUser.id}`)
            .then(res => res.json())
            .then(data => {
                setMessages(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error('History fetch error:', err));

        const handleNewMessage = (msg: any) => {
            if (msg.senderId === selectedUser.id || msg.senderId === currentUser.id) {
                setMessages(prev => [...prev, msg]);
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_sent', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_sent', handleNewMessage);
        };
    }, [selectedUser, currentUser]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessages(current => current.filter(msg => {
                if (!msg.expiresAt) return true;
                return new Date(msg.expiresAt) > new Date();
            }));
        }, 5000); // Check every 5s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messages.forEach(async (msg) => {
            if (decryptedCache[msg.id] !== undefined || !sharedSecret) return;

            const text = await decryptMessage(sharedSecret, msg.content, msg.iv);
            if (text === null) {
                setDecryptedCache(prev => ({ ...prev, [msg.id]: '⚠️ Retrying Handshake...' }));
                // Consider auto-retrying handshake once here if needed
                setHandshakeStatus('failed');
            } else {
                setDecryptedCache(prev => ({ ...prev, [msg.id]: text }));
            }
        });
    }, [messages, sharedSecret]);

    useEffect(scrollToBottom, [messages, decryptedCache]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedUser || !sharedSecret) return;

        const { content, iv } = await encryptMessage(sharedSecret, inputText);

        let finalTtl = ttlMode;
        if (ttlMode === 'custom') {
            finalTtl = `${customTtl}m`;
        }

        socket.emit('private_message', {
            senderId: currentUser.id,
            receiverId: selectedUser.id,
            content: content,
            iv: iv,
            ttl: finalTtl
        });

        setInputText('');
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 h-full flex items-center justify-center bg-[#0f172a]">
                <div className="text-center space-y-4 opacity-30">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.827-1.213L3 20l1.391-3.954A9.142 9.142 0 01 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-gray-400 font-semibold tracking-widest uppercase text-xs">Select identity to commence decryption</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full flex flex-col bg-[#0f172a] relative">
            {/* Header */}
            <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#111827]/50 backdrop-blur-xl z-20">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                        {selectedUser.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">{selectedUser.username}</h3>
                        <div className="flex items-center space-x-2">
                            <p className="text-[9px] text-blue-400 uppercase tracking-[0.2em] font-bold">Secure P2P Node</p>
                            {handshakeStatus === 'failed' && (
                                <button
                                    onClick={performHandshake}
                                    className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded hover:bg-red-500/40 transition-colors uppercase font-bold animate-pulse"
                                >
                                    ⚠ REPAIR KEYS
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Wipe Delay:</label>
                    <select
                        value={ttlMode}
                        onChange={(e) => setTtlMode(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 appearance-none text-center cursor-pointer hover:border-white/20 transition-all font-bold"
                    >
                        <option value="never">DISABLED</option>
                        <option value="1m">1 MINUTE</option>
                        <option value="1h">1 HOUR</option>
                        <option value="24h">24 HOURS</option>
                        <option value="custom">CUSTOM...</option>
                    </select>
                    {ttlMode === 'custom' && (
                        <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-2">
                            <input
                                type="number"
                                min="1"
                                value={customTtl}
                                onChange={(e) => setCustomTtl(e.target.value)}
                                className="w-12 py-1.5 text-[10px] text-center bg-transparent text-gray-300 outline-none font-bold"
                            />
                            <span className="text-[10px] text-gray-500 font-bold mr-1">MIN</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] ${isMe ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block px-5 py-3 rounded-2xl ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-500/10'
                                        : 'bg-[#1e293b] text-gray-200 rounded-tl-none border border-white/5'
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {decryptedCache[msg.id] || (isMe ? '🔒 Encrypted (You)' : '🔒 Decrypting...')}
                                        </p>
                                    </div>
                                    <div className="mt-1.5 flex items-center space-x-2 text-[9px] text-gray-500 uppercase font-bold tracking-tighter">
                                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {msg.expiresAt && <span className="text-orange-400/80">⌛ Auto-Wipe Active</span>}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-[#111827]/50 border-t border-white/5 backdrop-blur-xl">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center space-x-3 bg-black/40 p-1.5 rounded-2xl border border-white/5 focus-within:border-blue-500/30 transition-all shadow-inner">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-transparent px-5 py-3 text-sm text-gray-100 outline-none"
                        placeholder={`Message ${selectedUser.username}...`}
                    />
                    <button
                        type="submit"
                        className="px-6 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-blue-500/20 uppercase tracking-widest"
                    >
                        Transmit
                    </button>
                </form>
                <p className="text-[10px] text-gray-600 text-center mt-3 uppercase tracking-[0.3em] font-bold">End-To-End AES-GCM Encryption Active</p>
            </div>
        </div>
    );
};

export default ChatWindow;
