import React from 'react';
import { loginWithGitHub } from '../auth';

interface GitHubLoginButtonProps {
    onError?: (error: string) => void;
    onLoading?: (loading: boolean) => void;
    className?: string;
}

export const GitHubLoginButton: React.FC<GitHubLoginButtonProps> = ({
    onError,
    onLoading,
    className = ''
}) => {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        onLoading?.(true);

        const { error } = await loginWithGitHub();

        if (error) {
            setIsLoading(false);
            onLoading?.(false);
            onError?.(error.message || 'Erro ao fazer login com GitHub');
        }
        // Se não houver erro, o usuário será redirecionado
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isLoading}
            className={`
        flex items-center justify-center gap-3 w-full h-14 
        bg-[#24292F] text-white font-black uppercase tracking-[0.15em] text-sm
        hover:bg-[#1B1F23] transition-all duration-200
        border-2 border-black dark:border-white
        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]
        active:translate-y-[2px] active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
        >
            {isLoading ? (
                <span className="animate-pulse">Redirecionando...</span>
            ) : (
                <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>Entrar com GitHub</span>
                </>
            )}
        </button>
    );
};
