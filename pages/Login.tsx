
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

import { signUpWithEmail, resetPassword } from '../auth';

type ViewState = 'LOGIN' | 'REGISTER' | 'RECOVER';

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
    const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessage();

        if (registerData.password !== registerData.confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setIsLoading(true);

        const { error } = await signUpWithEmail(registerData.email, registerData.password, registerData.name);

        setIsLoading(false);

        if (error) {
            let errorText = error.message || 'Erro ao cadastrar.';
            if (errorText.includes('User already registered')) {
                errorText = 'Este email já possui cadastro.';
            }
            setMessage({ type: 'error', text: errorText });
        } else {
            setMessage({ type: 'success', text: 'Cadastro realizado! Verifique seu email para confirmar a conta.' });
            setTimeout(() => setView('LOGIN'), 5000);
        }
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
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background-light dark:bg-black overflow-hidden selection:bg-primary selection:text-white">

            {/* DYNAMIC MESH GRADIENT BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse stagger-2"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-400/10 blur-[100px] rounded-full animate-pulse stagger-1"></div>
            </div>

            {/* GRAIN OVERLAY */}
            <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

            <div className="relative z-10 w-full max-w-md animate-fade-in-up">

                {/* MAIN CARD: ULTRA PREMIUM GLASS */}
                <div className="bg-white/70 dark:bg-[#0A0A0A]/80 border-4 border-black dark:border-white/10 shadow-[0_30px_100px_rgba(0,0,255,0.15)] p-8 md:p-12 relative overflow-hidden glass transition-all duration-500 hover:shadow-[0_40px_120px_rgba(0,0,255,0.25)]">

                    {/* Decorative Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rotate-45 translate-x-16 -translate-y-16 pointer-events-none"></div>

                    {/* Header / Brand */}
                    <div className="mb-10 text-center relative z-10">
                        <div className="inline-flex size-16 bg-black dark:bg-white items-center justify-center border-4 border-primary mb-6 glow-blue transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                            <span className="material-symbols-outlined text-white dark:text-black text-3xl">precision_manufacturing</span>
                        </div>
                        <h1 className="text-black dark:text-white text-4xl font-black uppercase tracking-tighter leading-none mb-2">
                            {view === 'LOGIN' ? 'Painel Digital' : view === 'REGISTER' ? 'Novo Registro' : 'Recuperação'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                            Sistema de Gestão RinoScore
                        </p>
                    </div>

                    {/* Notification Area */}
                    {message && (
                        <div className={`mb-8 p-4 text-xs font-black uppercase tracking-wide border-l-4 animate-fade-in-up glass
                    ${message.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500'}
                `}>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">{message.type === 'error' ? 'error' : 'check_circle'}</span>
                                {message.text}
                            </div>
                        </div>
                    )}

                    {/* --- VIEW: LOGIN --- */}
                    {view === 'LOGIN' && (
                        <form onSubmit={handleLogin} className="flex flex-col gap-6 animate-fade-in stagger-1">
                            <div className="group relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300">
                                    <span className="material-symbols-outlined text-sm">alternate_email</span>
                                </span>
                                <input
                                    type="email"
                                    className="w-full h-14 bg-white/50 dark:bg-black/50 border-2 border-gray-200 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 p-3 pl-12 text-black dark:text-white font-bold uppercase text-xs transition-all outline-none rounded-lg"
                                    placeholder="USUÁRIO / EMAIL"
                                    value={loginData.email}
                                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                />
                            </div>
                            <div className="group relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300">
                                    <span className="material-symbols-outlined text-sm">lock_open</span>
                                </span>
                                <input
                                    type="password"
                                    className="w-full h-14 bg-white/50 dark:bg-black/50 border-2 border-gray-200 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 p-3 pl-12 text-black dark:text-white font-bold text-xs transition-all outline-none rounded-lg"
                                    placeholder="CHAVE DE ACESSO"
                                    value={loginData.password}
                                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 h-16 w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white border-none transition-all shadow-xl active:scale-95 disabled:opacity-50 brutal-btn flex items-center justify-center gap-3 text-sm glow-blue"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processando...</span>
                                    </div>
                                ) : (
                                    <><span>Acessar Dashboard</span><span className="material-symbols-outlined text-lg">arrow_forward</span></>
                                )}
                            </button>

                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                <button type="button" onClick={() => { clearMessage(); setView('REGISTER'); }} className="text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">person_add</span> Criar Conta
                                </button>
                                <button type="button" onClick={() => { clearMessage(); setView('RECOVER'); }} className="text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">help</span> Recuperar
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- VIEW: REGISTER --- */}
                    {view === 'REGISTER' && (
                        <form onSubmit={handleRegister} className="flex flex-col gap-4 animate-fade-in stagger-1">
                            <div className="group relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">badge</span>
                                </span>
                                <input
                                    type="text"
                                    className="w-full h-12 bg-white/50 dark:bg-black/50 border-2 border-gray-200 dark:border-white/10 focus:border-primary p-3 pl-12 text-black dark:text-white font-bold uppercase text-xs rounded-lg outline-none"
                                    placeholder="NOME COMPLETO"
                                    value={registerData.name}
                                    onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
                                />
                            </div>
                            <div className="group relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">mail</span>
                                </span>
                                <input
                                    type="email"
                                    className="w-full h-12 bg-white/50 dark:bg-black/50 border-2 border-gray-200 dark:border-white/10 focus:border-primary p-3 pl-12 text-black dark:text-white font-bold uppercase text-xs rounded-lg outline-none"
                                    placeholder="EMAIL"
                                    value={registerData.email}
                                    onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="password"
                                    className="w-full h-12 bg-white/50 dark:bg-black/50 border-2 border-gray-200 dark:border-white/10 focus:border-primary p-3 text-black dark:text-white font-bold text-xs rounded-lg outline-none"
                                    placeholder="SENHA"
                                    value={registerData.password}
                                    onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                                />
                                <input
                                    type="password"
                                    className="w-full h-12 bg-white/50 dark:bg-black/50 border-2 border-gray-200 dark:border-white/10 focus:border-primary p-3 text-black dark:text-white font-bold text-xs rounded-lg outline-none"
                                    placeholder="CONFIRMAR"
                                    value={registerData.confirmPassword}
                                    onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 h-14 w-full bg-primary text-white font-black uppercase tracking-[0.2em] hover:brightness-110 shadow-lg active:scale-95 transition-all text-xs rounded-lg"
                            >
                                {isLoading ? 'Registrando...' : 'Finalizar Cadastro'}
                            </button>

                            <button type="button" onClick={() => { clearMessage(); setView('LOGIN'); }} className="mt-4 text-[10px] font-black uppercase text-gray-500 hover:text-black dark:hover:text-white text-center">
                                Já possui conta? Faça Login
                            </button>
                        </form>
                    )}

                    {/* --- VIEW: RECOVER --- */}
                    {view === 'RECOVER' && (
                        <form onSubmit={handleRecover} className="flex flex-col gap-6 animate-fade-in stagger-1">
                            <p className="text-xs font-bold text-gray-400 text-center px-4 leading-relaxed uppercase">Instruções de recuperação serão enviadas para o seu endereço seguro.</p>

                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">send_and_archive</span>
                                </span>
                                <input
                                    type="email"
                                    className="w-full h-14 bg-white/50 dark:bg-black/50 border-2 border-gray-200 dark:border-white/10 focus:border-primary p-3 pl-12 text-black dark:text-white font-bold uppercase text-xs rounded-lg outline-none"
                                    placeholder="E-MAIL CADASTRADO"
                                    value={recoverEmail}
                                    onChange={e => setRecoverEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="h-14 w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all text-xs rounded-lg"
                            >
                                {isLoading ? 'Verificando...' : 'Solicitar Redefinição'}
                            </button>

                            <button type="button" onClick={() => { clearMessage(); setView('LOGIN'); }} className="text-[10px] font-black uppercase text-gray-500 hover:text-black dark:hover:text-white text-center">
                                Voltar para o portal
                            </button>
                        </form>
                    )}

                </div>

                {/* Footer Quote */}
                <div className="mt-12 text-center flex flex-col items-center animate-fade-in stagger-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] mb-4">Powered by Advanced Engineering</p>
                    <div className="flex items-center gap-4">
                        <div className="h-px w-8 bg-gray-300 dark:bg-white/10"></div>
                        <div className="size-1 bg-primary rounded-full"></div>
                        <div className="h-px w-8 bg-gray-300 dark:bg-white/10"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
