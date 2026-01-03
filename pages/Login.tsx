
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

import { resetPassword } from '../auth';

type ViewState = 'LOGIN' | 'RECOVER';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useApp();
    const [view, setView] = useState<ViewState>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Form States
    const [loginData, setLoginData] = useState({ email: 'admin@rino.com', password: '' });
    const [recoverEmail, setRecoverEmail] = useState('');

    const clearMessage = () => setMessage(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessage();

        // Simple validation
        if (!loginData.email) {
            setMessage({ type: 'error', text: 'Preencha o email.' });
            return;
        }

        setIsLoading(true);
        // Simulate network delay for effect
        setTimeout(async () => {
            const { error } = await login(loginData.email, loginData.password || 'demo');
            setIsLoading(false);

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                navigate('/dashboard');
            }
        }, 800);
    };

    const handleRecover = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessage();
        setIsLoading(true);

        const { error } = await resetPassword(recoverEmail);

        setIsLoading(false);

        if (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao enviar email.' });
        } else {
            setMessage({ type: 'success', text: `Link de recuperação enviado para ${recoverEmail}. Verifique sua caixa de entrada.` });
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-gray-100 dark:bg-black overflow-y-auto transition-colors duration-300">

            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#0000FF 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="relative z-10 w-full max-w-md animate-fade-in-up py-8">

                {/* MAIN CARD */}
                <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,255,1)] p-8 md:p-10 relative overflow-hidden transition-all duration-300">

                    {/* Header / Brand */}
                    <div className="mb-6 border-b-4 border-primary pb-4">
                        <h1 className="text-black dark:text-white text-3xl font-black uppercase tracking-tighter leading-none mb-1">
                            {view === 'LOGIN' ? 'Acesso Local' : 'Recuperar Chave'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                            Rino Score System v2.0 (Offline)
                        </p>
                    </div>

                    {/* Notification Area */}
                    {message && (
                        <div className={`mb-6 p-3 text-xs font-black uppercase tracking-wide border-l-4 animate-fade-in-up
                    ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600' : 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600'}
                `}>
                            {message.text}
                        </div>
                    )}

                    {/* --- VIEW: LOGIN --- */}
                    {view === 'LOGIN' && (
                        <form onSubmit={handleLogin} className="flex flex-col gap-5 animate-fade-in-up">
                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full h-12 bg-gray-50 dark:bg-black border-4 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none p-3 pl-10 text-black dark:text-white font-bold uppercase text-sm brutal-input"
                                    placeholder="EMAIL"
                                    value={loginData.email}
                                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="w-full h-12 bg-gray-50 dark:bg-black border-4 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none p-3 pl-10 text-black dark:text-white font-bold text-sm brutal-input"
                                    placeholder="SENHA"
                                    value={loginData.password}
                                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">key</span>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 h-14 w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white border-2 border-transparent transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-none brutal-btn flex items-center justify-center gap-2"
                            >
                                {isLoading ? <span className="animate-pulse">Acessando...</span> : <><span>Entrar</span><span className="material-symbols-outlined">login</span></>}
                            </button>




                            <div className="flex justify-end items-center mt-4 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-800">
                                <button type="button" onClick={() => { clearMessage(); setView('RECOVER'); }} className="text-xs font-bold uppercase text-gray-500 hover:text-primary hover:underline">Esqueci a Senha</button>
                            </div>
                        </form>
                    )}

                    {/* --- VIEW: RECOVER --- */}
                    {view === 'RECOVER' && (
                        <form onSubmit={handleRecover} className="flex flex-col gap-5 animate-fade-in-up">
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Informe seu e-mail para receber um link de redefinição de chave de segurança.</p>

                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full h-12 bg-gray-50 dark:bg-black border-4 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none p-3 pl-10 text-black dark:text-white font-bold uppercase text-sm brutal-input"
                                    placeholder="SEU EMAIL CADASTRADO"
                                    value={recoverEmail}
                                    onChange={e => setRecoverEmail(e.target.value)}
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">send</span>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 h-14 w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white border-2 border-transparent transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-none brutal-btn"
                            >
                                {isLoading ? 'Processando...' : 'Enviar Link'}
                            </button>

                            <button type="button" onClick={() => { clearMessage(); setView('LOGIN'); }} className="mt-2 text-xs font-bold uppercase text-gray-500 hover:text-black dark:hover:text-white hover:underline text-center">
                                Cancelar
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};
