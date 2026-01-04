
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
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <div className="flex items-start gap-4 flex-1">
                    <div className="size-12 md:size-14 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] shrink-0 transition-transform group-hover:scale-110">
                        <span className="material-symbols-outlined text-2xl md:text-3xl">{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl md:text-3xl font-black uppercase text-black dark:text-white tracking-tighter leading-none truncate md:whitespace-normal">
                            {title}
                        </h2>
                        <p className="text-[10px] font-bold uppercase text-primary tracking-widest mt-1">{subtitle}</p>
                    </div>
                </div>
                {actionLabel && actionLink && (
                    <button
                        onClick={() => navigate(actionLink)}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#222] text-black dark:text-white text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] active:translate-y-[2px] active:shadow-none shrink-0"
                    >
                        {actionLabel} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                )}
            </div>

            {/* Content Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-l-4 border-gray-200 dark:border-gray-800 pl-4 md:pl-6 ml-4 md:ml-7">

                {/* Left: Text Explanation */}
                <div className="lg:col-span-8 flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
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
    const [searchQuery, setSearchQuery] = useState('');

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
            const sections = ['auth', 'dashboard', 'pedidos', 'produtos', 'materiais', 'calculadora', 'config'];
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

    const filteredNav = navLinks.filter(l =>
        l.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full h-full pb-20 flex flex-col xl:flex-row gap-8 relative">

            {/* BACKGROUND DECORATION */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -z-10 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

            {/* LEFT: NAVIGATION SIDEBAR (Sticky) */}
            <aside className="xl:w-80 shrink-0 hidden md:block">
                <div className="sticky top-4 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-0 shadow-[8px_8px_0px_0px_#0000FF] flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
                    <div className="p-6 bg-black dark:bg-white text-white dark:text-black border-b-4 border-primary relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-20 bg-primary/20 rotate-45 translate-x-10 -translate-y-10 group-hover:bg-primary/40 transition-all"></div>
                        <h1 className="text-3xl font-black uppercase leading-none tracking-tighter relative z-10">Manual<br />Técnico</h1>
                        <div className="flex items-center gap-2 mt-3 relative z-10">
                            <span className="material-symbols-outlined text-sm">menu_book</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Base de Conhecimento</p>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-black border-b-2 border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="BUSCAR NO MANUAL..."
                                className="w-full pl-7 pr-3 py-2 bg-white dark:bg-[#111] border-2 border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase focus:border-primary focus:outline-none"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <nav className="flex flex-col py-2">
                        {filteredNav.map(link => (
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
            <div className="flex-1 max-w-5xl pt-0 lg:pr-2">

                {/* 0. AUTH & ACCOUNT */}
                <HelpSection
                    id="auth"
                    title="Conta e Acesso"
                    subtitle="Seu Espaço Digital"
                    icon="badge"
                    mockupType="LOGIN"
                    actionLabel="Ir para Login"
                >
                    <p><strong className="text-black dark:text-white">Bem-vindo ao seu escritório virtual.</strong> O sistema funciona na nuvem, igual ao seu e-mail ou redes sociais. Isso significa que você pode acessar de qualquer lugar.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Como funciona:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Criar Conta:</strong> Use seu e-mail para criar um acesso único e seguro.</li>
                        <li><strong>Entrar (Login):</strong> Digite seu e-mail e senha para abrir a marcenaria.</li>
                        <li><strong>Esqueci a Senha:</strong> Se tiver problemas, clique em "Esqueci a Senha" na tela de entrada para receber um link de ajuda no seu e-mail.</li>
                    </ul>

                    <AlertBlock type="info" title="Salvo Automaticamente">
                        Você não precisa clicar em "Salvar" o tempo todo. O sistema guarda tudo na nuvem assim que você confirma uma ação. Se o computador desligar, seus dados estarão seguros.
                    </AlertBlock>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 1. DASHBOARD */}
                <HelpSection
                    id="dashboard"
                    title="Dashboard Geral"
                    subtitle="Painel de Controle"
                    icon="dashboard"
                    mockupType="CHART"
                    actionLabel="Ver Resumo"
                    actionLink="/dashboard"
                >
                    <p><strong className="text-black dark:text-white">O Raio-X da sua empresa.</strong> Assim que você entra, vê um resumo de tudo o que está acontecendo: quanto vendeu, o que precisa entregar e quanto dinheiro entrou.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Entenda as Cores:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Cartões Grandes:</strong> Mostram o total de pedidos e o valor financeiro.</li>
                        <li><strong>Amarelo (Atenção):</strong> Pedidos que estão em aberto. É o seu trabalho na fila.</li>
                        <li><strong>Vermelho (Urgente):</strong> Pedidos atrasados. Resolva estes primeiro!</li>
                        <li><strong>Verde (Concluído):</strong> Pedidos entregues e pagos.</li>
                    </ul>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 dark:bg-white/5 p-3 border-l-2 border-primary">
                            <strong className="text-xs uppercase font-black block mb-1">Vendas Online vs Loja</strong>
                            <p className="text-xs">Veja se você vende mais pela internet (Whatsapp/Insta) ou presencialmente.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-3 border-l-2 border-green-500">
                            <strong className="text-xs uppercase font-black block mb-1">Lucro Real</strong>
                            <p className="text-xs">O sistema desconta os custos e mostra quanto dinheiro realmente sobrou no bolso.</p>
                        </div>
                    </div>

                    <ProTip>
                        Use os botões <strong>HOJE, 7D, MÊS</strong> no topo da tela para filtrar. Ex: Quer saber quanto vendeu só hoje? Clique em "HOJE".
                    </ProTip>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 2. PEDIDOS */}
                <HelpSection
                    id="pedidos"
                    title="Pedidos & Vendas"
                    subtitle="Anotando Serviços"
                    icon="shopping_cart"
                    mockupType="SIDEBAR"
                    actionLabel="Novo Pedido"
                    actionLink="/pedidos"
                >
                    <p>Aqui é onde você registra o trabalho. Em vez de usar um caderno, use esta tela para criar um pedido organizado.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Criando um Pedido:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Cliente e Prazo:</strong> Digite o nome do cliente e quando você promete entregar.</li>
                        <li><strong>Adicionar Produtos:</strong> Escolha os móveis que ele comprou. O preço aparece automático (baseado no seu cadastro de produtos), mas você pode dar desconto ou aumentar na hora.</li>
                        <li><strong>Status:</strong> Mude de "A Fazer" para "Entregue" conforme o trabalho anda.</li>
                    </ul>

                    <AlertBlock type="danger" title="Estoque Inteligente">
                        Quando você coloca um produto no pedido, o sistema já "reserva" ele do estoque. Se você cancelar o pedido, o item volta para a prateleira virtual.
                    </AlertBlock>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 3. PRODUTOS */}
                <HelpSection
                    id="produtos"
                    title="Seus Produtos"
                    subtitle="O que você vende"
                    icon="inventory_2"
                    mockupType="GRID"
                    actionLabel="Ver Catálogo"
                    actionLink="/produtos"
                >
                    <p>Cadastre aqui tudo o que a marcenaria faz. Pode ser "Armário Cozinha", "Mesa Jantar", etc. Uma vez cadastrado, fica fácil vender.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Calculando o Preço Certo:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Materiais (Receita):</strong> Diga quais materiais vai nesse móvel (ex: 2 chapas MDF, 1 cola). O sistema soma o custo sozinho!</li>
                        <li><strong>Mão de Obra:</strong> Coloque quanto custa o seu tempo ou do funcionário para fazer essa peça.</li>
                        <li><strong>Preço de Venda:</strong> Defina por quanto vai vender. O sistema te avisa quanto você está ganhando de lucro em cada peça.</li>
                    </ul>

                    <div className="bg-black text-white p-4 font-mono text-xs my-4 border-l-4 border-primary shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform">
                        <div className="absolute right-0 top-0 text-[100px] leading-none opacity-10 font-black pointer-events-none">BOM</div>
                        <span className="text-gray-500 block mb-2">// Exemplo de Custo</span>
                        <span className="text-primary font-bold">MÓVEL:</span> Armário Cozinha<br />
                        <span className="text-primary font-bold">GASTO DE MATERIAL:</span> R$ 450,00<br />
                        <span className="text-primary font-bold">GASTO DE MÃO DE OBRA:</span> R$ 300,00<br />
                        <span className="border-t border-gray-700 block mt-1 pt-1 font-black">CUSTO FINAL: R$ 750,00</span>
                    </div>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 4. MATERIAIS */}
                <HelpSection
                    id="materiais"
                    title="Insumos & Estoque"
                    subtitle="Seu Almoxarifado"
                    icon="forest"
                    mockupType="GRID"
                    actionLabel="Gerenciar Estoque"
                    actionLink="/materias"
                >
                    <p>Controle do que você compra (MDF, Cola, Parafusos, Lixas). Manter isso atualizado evita parar a produção por falta de material.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Facilidades:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Botões + e -:</strong> Chegou material? Clique no "+". Gastou? Clique no "-". Simples assim.</li>
                        <li><strong>Alerta de Acabando:</strong> Se o material estiver acabando (abaixo do mínimo que você definiu), ele fica vermelho ou amarelo para te avisar que precisa comprar.</li>
                    </ul>

                    <ProTip>
                        Sempre atualize o <strong>Preço de Custo</strong> quando comprar material novo. Assim, o sistema recalcula o custo dos seus móveis automaticamente e você nunca perde dinheiro.
                    </ProTip>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 5. CALCULADORA */}
                <HelpSection
                    id="calculadora"
                    title="Calculadora Rápida"
                    subtitle="Orçamento sem Compromisso"
                    icon="calculate"
                    mockupType="FORM"
                    actionLabel="Abrir Calculadora"
                    actionLink="/calculadora"
                >
                    <p>Cliente perguntou "quanto fica tal coisa?" no WhatsApp e você quer responder rápido sem cadastrar no sistema?</p>
                    <p className="mt-2">Use a Calculadora. Você joga os materiais, coloca sua margem de lucro (quanto quer ganhar %) e ela te dá o preço de venda na hora.</p>

                    <div className="mt-4 p-4 glass border-2 border-primary glow-blue">
                        <span className="text-[10px] font-black uppercase text-primary block mb-2">Para que serve?</span>
                        <p className="text-xs italic opacity-70">Ideal para orçamentos de balcão ou projetos muito específicos que você não quer salvar no catálogo geral.</p>
                    </div>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 6. CONFIGURAÇÕES */}
                <HelpSection
                    id="config"
                    title="Ajustes e Relatórios"
                    subtitle="Administração"
                    icon="settings"
                    mockupType="FORM"
                    actionLabel="Configurar"
                    actionLink="/configuracoes"
                >
                    <p>Aqui você deixa o sistema com a sua cara e tira relatórios para controlar o negócio.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">O que fazer aqui:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Logo da Empresa:</strong> Coloque sua marca. Ela vai aparecer nos documentos impressos.</li>
                        <li><strong>Tema Escuro/Claro:</strong> Escolha o visual que cansa menos a sua vista.</li>
                    </ul>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Relatórios (Planilhas):</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Baixar Pedidos, Produtos ou Materiais:</strong> Clique nos botões para baixar um arquivo do <strong>Excel</strong> todo bonitinho e organizado com seus dados. Ótimo para enviar pro contador ou guardar backup.</li>
                        <li><strong>Sincronizar Custos:</strong> Se mudou o preço do MDF, clique aqui e o sistema atualiza o preço de custo de TODOS os móveis que usam MDF de uma vez só.</li>
                    </ul>

                    <AlertBlock type="danger" title="Zona de Perigo">
                        O botão vermelho "Resetar Sistema" apaga TUDO. Só use se quiser começar do zero absoluto. Não tem volta!
                    </AlertBlock>
                </HelpSection>

                {/* FOOTER */}
                <div className="mt-20 pt-8 border-t-8 border-black dark:border-white text-center text-gray-400 bg-gray-50 dark:bg-[#111] p-12">
                    <div className="flex justify-center mb-4">
                        <div className="size-16 bg-black dark:bg-white flex items-center justify-center border-2 border-primary">
                            <span className="material-symbols-outlined text-3xl text-white dark:text-black">verified_user</span>
                        </div>
                    </div>
                    <p className="font-black uppercase text-sm tracking-[0.2em] mb-2 text-black dark:text-white">Sistema de Marcenaria v2.5</p>
                    <p className="text-[10px] max-w-md mx-auto leading-relaxed mb-4">Feito para simplificar sua oficina e organizar seu lucro.</p>
                    <p className="text-[9px] uppercase font-bold text-gray-500">Última atualização: {new Date().toLocaleDateString()}</p>
                </div>

            </div>
        </div>
    );
};
