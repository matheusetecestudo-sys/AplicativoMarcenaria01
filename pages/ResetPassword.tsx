
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../auth';
import { useApp } from '../context/AppContext';

export const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useApp();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // If not authenticated, redirect to login (Supabase recovery link authenticates on click)
    useEffect(() => {
        // Give a grace period for auth state to settle if needed, but usually onAuthStateChange fires fast
        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                // If we are not authenticated after a delay, it means the link was invalid or expired
                // However, we shouldn't block rendering immediately in case of race conditions
                // setMessage({ type: 'error', text: 'Sessão inválida ou expirada. Solicite a recuperação novamente.' });
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setIsLoading(true);
        const { error } = await updatePassword(password);
        setIsLoading(false);

        if (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao redefinir a senha.' });
        } else {
            setMessage({ type: 'success', text: 'Senha alterada com sucesso! Redirecionando...' });
            setTimeout(() => navigate('/dashboard'), 3000);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-gray-100 dark:bg-black">
            <div className="relative z-10 w-full max-w-md animate-fade-in-up py-8">
                <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,255,1)] p-8 relative overflow-hidden">

                    <div className="mb-6 border-b-4 border-primary pb-4">
                        <h1 className="text-black dark:text-white text-2xl font-black uppercase tracking-tighter leading-none mb-1">
                            Redefinir Senha
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                            Crie uma nova chave de acesso
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-6 p-3 text-xs font-black uppercase tracking-wide border-l-4 animate-fade-in-up
                            ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600' : 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600'}
                        `}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full h-12 bg-gray-50 dark:bg-black border-4 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none p-3 pl-10 text-black dark:text-white font-bold text-sm brutal-input"
                                placeholder="NOVA SENHA"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">key</span>
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full h-12 bg-gray-50 dark:bg-black border-4 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none p-3 pl-10 text-black dark:text-white font-bold text-sm brutal-input"
                                placeholder="CONFIRMAR NOVA SENHA"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">check_circle</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 h-14 w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white border-2 border-transparent transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-none brutal-btn"
                        >
                            {isLoading ? 'Salvando...' : 'Redefinir Senha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
