import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateKeyPair, exportPublicKey } from '../utils/crypto';

interface LoginPageProps {
    onLogin?: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = isLogin ? 'login' : 'register';
        let body: any = { username, password };

        try {
            // Generate ephemeral keys for this session
            const keyPair = await generateKeyPair();
            const exportedPublic = await exportPublicKey(keyPair.publicKey);

            // Store private key in session
            (window as any).sessionPrivateKey = keyPair.privateKey;

            // Always send public key to rotate/register it
            body.publicKey = exportedPublic;

            const res = await fetch(`http://localhost:3000/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.user) {
                onLogin?.(data.user);
            } else {
                alert(data.error || 'Authentication failed');
            }
        } catch (err) {
            console.error(err);
            alert('Cannot connect to secure server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4 font-sans text-gray-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(3,7,18,1))]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#161b2c] border border-white/5 shadow-2xl rounded-3xl p-10 relative z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">ZeroTrace</h1>
                    <p className="text-gray-400 text-sm">Professional Encrypted Communication</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="jan_kowalski"
                            className="w-full h-12 bg-black/30 border border-white/10 rounded-2xl px-5 transition-all focus:ring-2 focus:ring-blue-500/50 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-12 bg-black/30 border border-white/10 rounded-2xl px-5 transition-all focus:ring-2 focus:ring-blue-500/50 outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Decrypting...' : (isLogin ? 'Sign In' : 'Initialize Identity')}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        {isLogin ? "Don't have a secure identity? Join" : "Already have keys? Sign in"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
