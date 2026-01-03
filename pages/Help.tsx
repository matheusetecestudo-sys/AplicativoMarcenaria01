
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- VISUAL COMPONENTS ---

const ShortcutKey: React.FC<{ keys: string[] }> = ({ keys }) => (
    <div className="flex gap-1">
        {keys.map((k, i) => (
            <React.Fragment key={i}>
                <span className="bg-gray-200 dark:bg-gray-800 border-b-2 border-gray-400 dark:border-gray-600 px-2 py-1 rounded-[1px] text-[10px] font-black font-mono text-black dark:text-white uppercase min-w-[20px] text-center shadow-sm">
                    {k}
                </span>
                {i < keys.length - 1 && <span className="self-center text-gray-400 font-bold text-xs">+</span>}
            </React.Fragment>
        ))}
    </div>
);

const ProTip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-6 bg-[#FFFF00]/10 border-l-4 border-[#FFFF00] p-4 flex gap-4 items-start animate-fade-in-up">
        <span className="material-symbols-outlined text-[#FFFF00] text-xl shrink-0">tips_and_updates</span>
        <div>
            <span className="block text-[10px] font-black uppercase text-[#FFFF00] tracking-widest mb-1">Dica de Mestre</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{children}</p>
        </div>
    </div>
);

const AlertBlock: React.FC<{ type: 'danger' | 'info', title: string, children: React.ReactNode }> = ({ type, title, children }) => {
    const colorClass = type === 'danger' ? 'border-[#FF0000] bg-[#FF0000]/5 text-[#FF0000]' : 'border-blue-500 bg-blue-500/5 text-blue-500';
    const icon = type === 'danger' ? 'warning' : 'info';

    return (
        <div className={`mt-4 border-l-4 ${colorClass} p-4 flex gap-3 items-start`}>
            <span className="material-symbols-outlined shrink-0">{icon}</span>
            <div>
                <strong className="block text-xs uppercase font-black tracking-wider mb-1">{title}</strong>
                <div className="text-sm opacity-80 leading-relaxed">{children}</div>
            </div>
        </div>
    );
};

// Abstract UI Representations for "Visual Help"
const MockupBlock: React.FC<{ type: 'SIDEBAR' | 'GRID' | 'FORM' | 'CHART' | 'LOGIN' }> = ({ type }) => {
    if (type === 'SIDEBAR') return (
        <div className="w-full h-24 border-2 border-gray-300 dark:border-gray-700 flex gap-2 p-2 bg-gray-50 dark:bg-black">
            <div className="w-1/4 h-full bg-primary/20 border border-primary border-dashed"></div>
            <div className="w-3/4 h-full flex flex-col gap-2">
                <div className="w-full h-1/4 bg-gray-200 dark:bg-gray-800"></div>
                <div className="w-full h-3/4 bg-gray-200 dark:bg-gray-800"></div>
            </div>
        </div>
    );
    if (type === 'GRID') return (
        <div className="w-full h-24 border-2 border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-black grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => <div key={i} className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"></div>)}
        </div>
    );
    if (type === 'FORM') return (
        <div className="w-full h-24 border-2 border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-black flex flex-col gap-2">
            <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-700"></div>
            <div className="w-full h-8 border border-gray-400 dark:border-gray-600"></div>
            <div className="w-1/3 h-6 bg-primary/50 self-end mt-auto"></div>
        </div>
    );
    if (type === 'LOGIN') return (
        <div className="w-full h-24 border-2 border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-black flex items-center justify-center">
            <div className="w-1/2 h-16 border-2 border-primary bg-white dark:bg-black shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] flex flex-col gap-1 p-1">
                <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-800"></div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="h-4 w-1/2 bg-primary mt-auto self-center"></div>
            </div>
        </div>
    );
    return (
        <div className="w-full h-24 border-2 border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-black flex items-end gap-1">
            <div className="w-1/5 h-[40%] bg-gray-300 dark:bg-gray-700"></div>
            <div className="w-1/5 h-[70%] bg-primary/50"></div>
            <div className="w-1/5 h-[50%] bg-gray-300 dark:bg-gray-700"></div>
            <div className="w-1/5 h-[90%] bg-primary"></div>
            <div className="w-1/5 h-[60%] bg-gray-300 dark:bg-gray-700"></div>
        </div>
    );
};

const HelpSection: React.FC<{
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    actionLabel?: string;
    actionLink?: string;
    mockupType?: 'SIDEBAR' | 'GRID' | 'FORM' | 'CHART' | 'LOGIN';
    children: React.ReactNode
}> = ({ id, title, subtitle, icon, actionLabel, actionLink, mockupType, children }) => {
    const navigate = useNavigate();

    return (
        <div id={id} className="scroll-mt-32 mb-20 animate-fade-in-up group relative">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="size-14 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border-4 border-primary shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] shrink-0">
                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-black uppercase text-black dark:text-white tracking-tighter leading-none">
                        {title}
                    </h2>
                    <p className="text-xs font-bold uppercase text-primary tracking-widest mt-1">{subtitle}</p>
                </div>
                {actionLabel && actionLink && (
                    <button
                        onClick={() => navigate(actionLink)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#222] text-black dark:text-white text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] active:translate-y-[2px] active:shadow-none"
                    >
                        {actionLabel} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                )}
            </div>

            {/* Content Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-l-4 border-gray-200 dark:border-gray-800 pl-6 ml-7">

                {/* Left: Text Explanation */}
                <div className="lg:col-span-8 flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                    {children}
                </div>

                {/* Right: Visual Aid */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {mockupType && (
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Layout de Referência</span>
                            <MockupBlock type={mockupType} />
                        </div>
                    )}

                    <div className="bg-gray-100 dark:bg-[#111] p-4 border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <h4 className="font-black uppercase text-[10px] text-gray-500 mb-3 tracking-widest">Passo a Passo</h4>
                        <ul className="space-y-3">
                            <li className="flex gap-2 items-center text-xs font-bold text-black dark:text-white">
                                <span className="size-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] shrink-0">1</span>
                                Acessar Módulo
                            </li>
                            <li className="flex gap-2 items-center text-xs font-bold text-black dark:text-white">
                                <span className="size-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] shrink-0">2</span>
                                Inserir Informações
                            </li>
                            <li className="flex gap-2 items-center text-xs font-bold text-black dark:text-white">
                                <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0">3</span>
                                Salvar & Processar
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

export const Help: React.FC = () => {
    const [activeSection, setActiveSection] = useState('auth');

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    // Auto-detect active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['auth', 'dashboard', 'pedidos', 'produtos', 'materias', 'calculadora', 'config'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= 300) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        document.querySelector('main')?.addEventListener('scroll', handleScroll);
        return () => document.querySelector('main')?.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { id: 'auth', label: '00. Conta e Acesso', icon: 'badge' },
        { id: 'dashboard', label: '01. Dashboard Geral', icon: 'dashboard' },
        { id: 'pedidos', label: '02. Pedidos e PDV', icon: 'shopping_cart' },
        { id: 'produtos', label: '03. Produtos e Receitas', icon: 'inventory_2' },
        { id: 'materiais', label: '04. Insumos e Estoque', icon: 'forest' },
        { id: 'calculadora', label: '05. Calculadora de Custo', icon: 'calculate' },
        { id: 'config', label: '06. Configurações', icon: 'settings' },
    ];

    return (
        <div className="w-full h-full pb-12 flex flex-col xl:flex-row gap-8 relative">

            {/* LEFT: NAVIGATION SIDEBAR (Sticky) */}
            <aside className="xl:w-80 shrink-0 hidden md:block">
                <div className="sticky top-4 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-0 shadow-[8px_8px_0px_0px_#0000FF] flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
                    <div className="p-6 bg-black dark:bg-white text-white dark:text-black border-b-4 border-primary">
                        <h1 className="text-3xl font-black uppercase leading-none tracking-tighter">Manual<br />Técnico</h1>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="material-symbols-outlined text-sm">menu_book</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Base de Conhecimento</p>
                        </div>
                    </div>

                    <nav className="flex flex-col py-2">
                        {navLinks.map(link => (
                            <button
                                key={link.id}
                                onClick={() => scrollTo(link.id)}
                                className={`
                                    text-left px-6 py-4 font-bold uppercase text-xs tracking-wider flex items-center justify-between transition-all group border-l-[6px]
                                    ${activeSection === link.id
                                        ? 'bg-gray-100 dark:bg-white/10 border-primary text-black dark:text-white'
                                        : 'bg-transparent border-transparent text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                    }
                                `}
                            >
                                <span className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${activeSection === link.id ? 'text-primary' : ''}`}>{link.icon}</span>
                                    {link.label}
                                </span>
                            </button>
                        ))}
                    </nav>

                    {/* Shortcuts Legend */}
                    <div className="mt-auto p-4 bg-gray-50 dark:bg-black border-t-2 border-gray-200 dark:border-gray-800">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest border-b border-dashed border-gray-300 dark:border-gray-700 pb-2">Atalhos Globais</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                                <span>Confirmar Ação</span> <ShortcutKey keys={['Enter']} />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                                <span>Cancelar / Fechar</span> <ShortcutKey keys={['Esc']} />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                                <span>Navegar Campos</span> <ShortcutKey keys={['Tab']} />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* RIGHT: CONTENT */}
            <div className="flex-1 max-w-5xl pt-2 pr-2">

                {/* 0. AUTH & ACCOUNT */}
                <HelpSection
                    id="auth"
                    title="Conta e Acesso"
                    subtitle="Login, Cadastro e Nuvem"
                    icon="badge"
                    mockupType="LOGIN"
                    actionLabel="Ir para Login"
                >
                    <p><strong className="text-black dark:text-white">Seu passaporte para o RinoScore.</strong> O sistema utiliza autenticação moderna via Supabase para garantir que seus dados estejam seguros e acessíveis apenas por você.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Funcionalidades:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Cadastro (Sign Up):</strong> Crie uma conta gratuita usando seu e-mail. Uma conta permite sincronizar dados entre múltiplos dispositivos.</li>
                        <li><strong>Login Seguro:</strong> Acesso criptografado. Seus dados são carregados automaticamente ao entrar.</li>
                        <li><strong>Recuperação de Senha:</strong> Esqueceu a senha? Use a opção "Esqueci a Senha" na tela inicial para receber um link de redefinição no seu e-mail.</li>
                    </ul>

                    <AlertBlock type="info" title="Sincronização na Nuvem">
                        Ao estar logado, todas as suas ações (criar pedido, adicionar produto, alterar configurações) são salvas automaticamente na nuvem (Supabase). Se você usar outro computador e logar com a mesma conta, seus dados estarão lá.
                    </AlertBlock>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 1. DASHBOARD */}
                <HelpSection
                    id="dashboard"
                    title="Dashboard Geral"
                    subtitle="Visão Panorâmica da Operação"
                    icon="dashboard"
                    mockupType="CHART"
                    actionLabel="Ir para Dashboard"
                    actionLink="/dashboard"
                >
                    <p><strong className="text-black dark:text-white">O Centro de Comando.</strong> Esta tela consolida todas as métricas vitais da sua marcenaria em tempo real, permitindo decisões rápidas baseadas em dados.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Indicadores (KPIs):</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Fluxo Total:</strong> Volume absoluto de pedidos no período selecionado.</li>
                        <li><strong>Em Aberto (Amarelo):</strong> Pedidos ativos que requerem atenção (produção ou entrega).</li>
                        <li><strong>Crítico (Vermelho):</strong> Pedidos atrasados. O sistema alerta visualmente para priorização imediata.</li>
                        <li><strong>Finalizados (Verde):</strong> Sucesso da operação. Pedidos entregues e faturados.</li>
                    </ul>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 dark:bg-white/5 p-3 border-l-2 border-primary">
                            <strong className="text-xs uppercase font-black block mb-1">Canais de Venda</strong>
                            <p className="text-xs">As "Turbinas" mostram a proporção de vendas Físicas vs Online, ajudando a entender de onde vem seu lucro.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-3 border-l-2 border-green-500">
                            <strong className="text-xs uppercase font-black block mb-1">Financeiro</strong>
                            <p className="text-xs">Gráfico de barras combinando Faturamento e Custo para revelar o Lucro Líquido real do dia/mês.</p>
                        </div>
                    </div>

                    <ProTip>
                        Utilize os filtros de tempo no topo (HOJE, 7D, MÊS) para isolar análises. O filtro afeta todos os números da tela instantaneamente.
                    </ProTip>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 2. PEDIDOS */}
                <HelpSection
                    id="pedidos"
                    title="Pedidos & PDV"
                    subtitle="Gestão de Vendas e Produção"
                    icon="shopping_cart"
                    mockupType="SIDEBAR"
                    actionLabel="Novo Pedido"
                    actionLink="/pedidos"
                >
                    <p>O coração operacional. Aqui você lança vendas e acompanha o status de produção.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Como criar um pedido:</h3>
                    <ol className="list-decimal list-inside space-y-2 marker:font-black marker:text-black dark:marker:text-white">
                        <li>Preencha os dados do <strong>Cliente</strong> e selecione a <strong>Data de Entrega</strong>.</li>
                        <li>Na seção de itens, escolha os produtos. O preço unitário é puxado automaticamente do cadastro, mas pode ser editado.</li>
                        <li>Defina o Canal (Online/Físico) e Frete se houver.</li>
                        <li>Clique em <strong>LANÇAR PEDIDO</strong>.</li>
                    </ol>

                    <AlertBlock type="danger" title="Impacto no Estoque">
                        Ao criar um pedido, o sistema <strong>reserva</strong> automaticamente o estoque dos produtos acabados. Se você excluir um pedido pendente, o estoque é devolvido. Ao concluir, a baixa é definitiva.
                    </AlertBlock>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 3. PRODUTOS */}
                <HelpSection
                    id="produtos"
                    title="Produtos & Receitas"
                    subtitle="Catálogo Inteligente"
                    icon="inventory_2"
                    mockupType="GRID"
                    actionLabel="Ver Catálogo"
                    actionLink="/produtos"
                >
                    <p>Cadastre seus móveis com inteligência de engenharia. O sistema usa o conceito de <strong>B.O.M. (Bill of Materials)</strong>.</p>

                    <div className="bg-black text-white p-4 font-mono text-xs my-4 border-l-4 border-primary shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform">
                        <div className="absolute right-0 top-0 text-[100px] leading-none opacity-10 font-black pointer-events-none">BOM</div>
                        <span className="text-gray-500 block mb-2">// Exemplo de Receita</span>
                        <span className="text-primary font-bold">PRODUTO:</span> Mesa Industrial<br />
                        <span className="text-primary font-bold">PREÇO VENDA:</span> R$ 1.200,00<br />
                        <span className="text-primary font-bold">INSUMOS (Custo Automático):</span><br />
                        <span className="text-green-400 pl-4">+</span> Ferro Metalon (6m)<br />
                        <span className="text-green-400 pl-4">+</span> Tábua Pinus (2m²)<br />
                        <span className="text-green-400 pl-4">+</span> Verniz (0.5L)
                    </div>

                    <p>Isso permite que o sistema calcule automaticamente o <strong>Custo de Produção</strong> baseando-se no preço atual dos insumos cadastrados.</p>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 4. MATERIAIS */}
                <HelpSection
                    id="materiais"
                    title="Insumos & Estoque"
                    subtitle="Almoxarifado"
                    icon="forest"
                    mockupType="GRID"
                    actionLabel="Gerenciar Insumos"
                    actionLink="/materias"
                >
                    <p>Controle rigoroso de matéria-prima. Evite paradas na produção por falta de material.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Campos Vitais:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Custo Unitário:</strong> Atualize sempre que comprar material novo. Isso recalcula o lucro de todos os produtos que usam este material.</li>
                        <li><strong>Estoque Mínimo:</strong> O "Gatilho de Compra". Se o estoque cair abaixo deste número, alertas visuais aparecerão no Dashboard.</li>
                    </ul>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 5. CALCULADORA */}
                <HelpSection
                    id="calculadora"
                    title="Calculadora de Custo"
                    subtitle="Orçamentos Rápidos"
                    icon="calculate"
                    mockupType="FORM"
                    actionLabel="Abrir Calculadora"
                    actionLink="/calculadora"
                >
                    <p>Ferramenta para orçar projetos personalizados (Bespoke) sem afetar seu banco de dados oficial.</p>
                    <p>Ideal para atendimentos rápidos via WhatsApp ou balcão. Adicione materiais, mão de obra e margem de lucro para gerar um preço de venda sugerido com base científica em seus custos.</p>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 6. CONFIGURAÇÕES */}
                <HelpSection
                    id="config"
                    title="Configurações & Dados"
                    subtitle="Administração do Sistema"
                    icon="settings"
                    mockupType="FORM"
                    actionLabel="Ajustes"
                    actionLink="/configuracoes"
                >
                    <p>Central de personalização e segurança dos dados.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Identidade Visual:</h3>
                    <p>Faça upload do seu logotipo para personalizar o sistema. A imagem aparecerá no topo do menu lateral e nos relatórios impressos.</p>
                    <ProTip>Use imagens PNG com fundo transparente para melhor resultado.</ProTip>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Gestão de Dados:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Backup (Exportar):</strong> Baixa um arquivo <code>.json</code> com todos os seus dados.</li>
                        <li><strong>Restaurar (Importar):</strong> Lê um arquivo de backup. Se estiver online, esses dados serão enviados para a nuvem, atualizando seu cadastro.</li>
                        <li><strong>Resetar Fábrica:</strong> <span className="text-red-600 font-bold">PERIGO.</span> Apaga todos os pedidos, produtos e materiais do banco de dados (nuvem e local). Use com cautela.</li>
                    </ul>
                </HelpSection>

                {/* FOOTER */}
                <div className="mt-20 pt-8 border-t-8 border-black dark:border-white text-center text-gray-400 bg-gray-50 dark:bg-[#111] p-12">
                    <div className="flex justify-center mb-4">
                        <div className="size-16 bg-black dark:bg-white flex items-center justify-center border-2 border-primary">
                            <span className="material-symbols-outlined text-3xl text-white dark:text-black">verified_user</span>
                        </div>
                    </div>
                    <p className="font-black uppercase text-sm tracking-[0.2em] mb-2 text-black dark:text-white">RinoScore System v2.1</p>
                    <p className="text-[10px] max-w-md mx-auto leading-relaxed mb-4">Desenvolvido com arquitetura reativa para máxima performance. Sincronização em tempo real habilitada.</p>
                    <p className="text-[9px] uppercase font-bold text-gray-500">Documentação Atualizada: {new Date().toLocaleDateString()}</p>
                </div>

            </div>
        </div>
    );
};
