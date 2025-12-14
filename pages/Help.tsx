
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- VISUAL COMPONENTS ---

const ShortcutKey: React.FC<{ keys: string[] }> = ({ keys }) => (
    <div className="flex gap-1">
        {keys.map((k, i) => (
            <React.Fragment key={i}>
                <span className="bg-gray-200 dark:bg-gray-800 border-b-2 border-gray-400 dark:border-gray-600 px-2 py-1 rounded-[1px] text-[10px] font-black font-mono text-black dark:text-white uppercase min-w-[20px] text-center">
                    {k}
                </span>
                {i < keys.length - 1 && <span className="self-center text-gray-400 font-bold text-xs">+</span>}
            </React.Fragment>
        ))}
    </div>
);

const ProTip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-6 bg-[#FFFF00]/10 border-l-4 border-[#FFFF00] p-4 flex gap-4 items-start">
        <span className="material-symbols-outlined text-[#FFFF00] text-xl shrink-0">tips_and_updates</span>
        <div>
            <span className="block text-[10px] font-black uppercase text-[#FFFF00] tracking-widest mb-1">Dica Operacional</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{children}</p>
        </div>
    </div>
);

// Abstract UI Representations for "Visual Help"
const MockupBlock: React.FC<{ type: 'SIDEBAR' | 'GRID' | 'FORM' | 'CHART' }> = ({ type }) => {
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
            {[1,2,3].map(i => <div key={i} className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"></div>)}
        </div>
    );
    if (type === 'FORM') return (
        <div className="w-full h-24 border-2 border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-black flex flex-col gap-2">
             <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-700"></div>
             <div className="w-full h-8 border border-gray-400 dark:border-gray-600"></div>
             <div className="w-1/3 h-6 bg-primary/50 self-end mt-auto"></div>
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
    mockupType?: 'SIDEBAR' | 'GRID' | 'FORM' | 'CHART';
    children: React.ReactNode 
}> = ({ id, title, subtitle, icon, actionLabel, actionLink, mockupType, children }) => {
    const navigate = useNavigate();
    
    return (
        <div id={id} className="scroll-mt-24 mb-20 animate-fade-in-up group relative">
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
                        <h4 className="font-black uppercase text-[10px] text-gray-500 mb-3 tracking-widest">Fluxo Recomendado</h4>
                        <ul className="space-y-3">
                            <li className="flex gap-2 items-center text-xs font-bold text-black dark:text-white">
                                <span className="size-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px]">1</span>
                                Entrada de Dados
                            </li>
                            <li className="flex gap-2 items-center text-xs font-bold text-black dark:text-white">
                                <span className="size-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px]">2</span>
                                Processamento
                            </li>
                            <li className="flex gap-2 items-center text-xs font-bold text-black dark:text-white">
                                <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">3</span>
                                Análise de Resultado
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
    const [activeSection, setActiveSection] = useState('dashboard');

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    const navLinks = [
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
            <aside className="xl:w-80 shrink-0">
                <div className="sticky top-4 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-0 shadow-[8px_8px_0px_0px_#0000FF] flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
                    <div className="p-6 bg-black dark:bg-white text-white dark:text-black border-b-4 border-primary">
                        <h1 className="text-3xl font-black uppercase leading-none tracking-tighter">Manual<br/>Técnico</h1>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="material-symbols-outlined text-sm">engineering</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Doc. Oficial v2.0</p>
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
                                <span>Próximo Campo</span> <ShortcutKey keys={['Tab']} />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* RIGHT: CONTENT */}
            <div className="flex-1 max-w-5xl pt-2 pr-2">
                
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
                    <p><strong className="text-black dark:text-white">O Centro de Comando.</strong> Esta tela consolida todas as métricas vitais da sua marcenaria em tempo real.</p>
                    
                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Elementos Chave:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Monitor de Status (Topo):</strong> Relógio do sistema e indicador de banco de dados.</li>
                        <li><strong>Filtro Temporal (Toolbar):</strong> Define o período de análise (HOJE, 7D, MÊS, ANO). Afeta todos os gráficos.</li>
                        <li><strong>Cartões KPI:</strong>
                            <ul className="pl-6 list-square text-xs mt-1 text-gray-500 space-y-1">
                                <li><span className="text-yellow-600 font-bold">EM ABERTO:</span> Pedidos aguardando produção ou entrega.</li>
                                <li><span className="text-red-600 font-bold">CRÍTICO:</span> Pedidos cuja data atual ultrapassou o prazo de entrega.</li>
                                <li><span className="text-green-600 font-bold">FINALIZADOS:</span> Pedidos entregues e pagos.</li>
                            </ul>
                        </li>
                        <li><strong>Gráfico Financeiro:</strong> Compara Faturamento (Barras Azuis), Custos (Barras Vermelhas) e Lucro Líquido (Linha Verde).</li>
                    </ul>

                    <ProTip>
                        Passe o mouse sobre as barras do gráfico financeiro para ver o detalhamento exato de <strong>Lucro Real</strong> daquele dia ou mês.
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
                    <p>Esta tela é dividida em duas áreas principais para máxima eficiência:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                        <div className="border-2 border-black dark:border-white p-4 bg-gray-50 dark:bg-[#111]">
                            <h4 className="font-black uppercase text-xs mb-2 text-primary">Esquerda: Construtor (PDV)</h4>
                            <p className="text-xs">Onde você cria novos pedidos. Selecione o cliente, a data de entrega, o canal de venda (Online/Físico) e adicione produtos ao carrinho.</p>
                        </div>
                        <div className="border-2 border-gray-300 dark:border-gray-700 p-4">
                            <h4 className="font-black uppercase text-xs mb-2 text-gray-500">Direita: Histórico</h4>
                            <p className="text-xs">Lista cronológica de pedidos. Aqui você altera o status (Pendente &rarr; Concluído) ou exclui registros.</p>
                        </div>
                    </div>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Fluxo de Status:</h3>
                    <p>O sistema altera estoques automaticamente baseado no status:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1 marker:text-primary">
                        <li><strong>Criação:</strong> Reserva estoque do <em>Produto Acabado</em>.</li>
                        <li><strong>Conclusão:</strong> Confirma a saída definitiva e contabiliza no financeiro.</li>
                        <li><strong>Exclusão:</strong> Se o pedido estava pendente, o estoque é devolvido.</li>
                    </ul>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 3. PRODUTOS */}
                <HelpSection 
                    id="produtos" 
                    title="Produtos & Receitas" 
                    subtitle="Catálogo e Engenharia"
                    icon="inventory_2"
                    mockupType="GRID"
                    actionLabel="Catálogo" 
                    actionLink="/produtos"
                >
                    <p>Cadastre aqui os móveis que sua marcenaria produz. O diferencial é a <strong>Ficha Técnica (Receita)</strong>.</p>
                    
                    <div className="bg-black text-white p-4 font-mono text-xs my-4 border-l-4 border-primary shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-[100px] leading-none opacity-10 font-black pointer-events-none">BOM</div>
                        <span className="text-gray-500 block mb-2">// Bill of Materials (Receita)</span>
                        <span className="text-primary font-bold">PRODUTO:</span> Cadeira Eames<br/>
                        <span className="text-primary font-bold">COMPOSIÇÃO:</span><br/>
                        &nbsp;&nbsp;[1] Assento Polipropileno<br/>
                        &nbsp;&nbsp;[4] Pés de Madeira<br/>
                        &nbsp;&nbsp;[8] Parafusos Fixação
                    </div>

                    <p>Ao definir a composição, o sistema saberá exatamente quais insumos baixar quando este produto for vendido.</p>
                    <p className="mt-2"><strong>Imagens:</strong> Você pode fazer upload de uma foto do seu computador ou colar uma URL da internet (Hotlink) para economizar espaço.</p>
                </HelpSection>

                <hr className="border-t-2 border-dashed border-gray-300 dark:border-gray-800 mb-12 opacity-50" />

                {/* 4. MATERIAIS */}
                <HelpSection 
                    id="materiais" 
                    title="Insumos & Estoque" 
                    subtitle="Controle de Matéria-Prima"
                    icon="forest"
                    mockupType="GRID"
                    actionLabel="Insumos" 
                    actionLink="/materias"
                >
                    <p>Gerencie madeira, verniz, lixas, parafusos e ferragens. É a base de cálculo de custo da sua empresa.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Campos Críticos:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Unidade (UN):</strong> Como você compra? (m², metros lineares, litros, caixas). Mantenha consistência.</li>
                        <li><strong>Custo Unitário:</strong> Preço de reposição atual. Afeta o cálculo de lucro dos produtos.</li>
                        <li><strong>Ponto de Alerta (Min):</strong> Quando o estoque atingir este número, o sistema exibirá avisos visuais em vermelho/amarelo em todo o painel.</li>
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
                    <p>Uma ferramenta isolada para orçar projetos personalizados (Bespoke) sem sujar seu banco de dados principal.</p>
                    <p>Adicione materiais avulsos, estime horas de mão de obra e defina sua margem de lucro desejada. O sistema gera um <strong>Recibo Visual</strong> com o preço final sugerido.</p>
                    
                    <ProTip>
                        Use a calculadora durante atendimentos ao cliente para dar estimativas de preço rápidas e profissionais baseadas em custos reais.
                    </ProTip>
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
                    <p>Central de controle da aparência e segurança dos dados.</p>

                    <h3 className="text-black dark:text-white font-black uppercase text-xs mt-4 mb-2">Funcionalidades:</h3>
                    <ul className="list-disc list-inside space-y-2 marker:text-primary">
                        <li><strong>Identidade:</strong> Altere Nome, Logo e CNPJ da empresa (aparece nos relatórios).</li>
                        <li><strong>Aparência:</strong> Alterne entre Tema Claro/Escuro e densidade de informações (Compacto/Padrão).</li>
                        <li><strong>Backup (JSON):</strong> Exporta todos os dados do navegador para um arquivo seguro. Faça isso semanalmente.</li>
                        <li><strong>Relatórios:</strong> Gera um PDF formatado para impressão com o resumo financeiro e produtos mais vendidos do período selecionado.</li>
                    </ul>
                </HelpSection>

                {/* FOOTER */}
                <div className="mt-20 pt-8 border-t-8 border-black dark:border-white text-center text-gray-400 bg-gray-50 dark:bg-[#111] p-12">
                    <span className="material-symbols-outlined text-4xl mb-4">verified_user</span>
                    <p className="font-black uppercase text-sm tracking-[0.2em] mb-2 text-black dark:text-white">Rino Score System v2.0</p>
                    <p className="text-[10px] max-w-md mx-auto leading-relaxed">Desenvolvido com arquitetura React + Tailwind para máxima performance local. Não requer conexão constante com internet para operações básicas.</p>
                </div>

            </div>
        </div>
    );
};
