
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    AreaChart, Area, PieChart, Pie, Cell, ReferenceLine, CartesianGrid, Brush
} from 'recharts';

// Custom Brutalist Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black border-2 border-white p-3 shadow-[4px_4px_0px_0px_#0000FF] z-50 relative min-w-[150px]">
                <p className="text-white font-black uppercase text-xs mb-2 border-b border-gray-700 pb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between items-center gap-4 mb-1">
                        <span className="text-[10px] font-bold uppercase" style={{ color: entry.color }}>{entry.name}</span>
                        <span className="text-white font-mono font-bold text-sm">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const Stock: React.FC = () => {
    const { products, materials, settings } = useApp();
    const isDark = settings.appearance.theme === 'Escuro';

    const chartAxisColor = isDark ? '#666' : '#444';
    const chartTickColor = isDark ? '#888' : '#000';

    // 1. Data Processing
    const totalProductStock = products.reduce((acc, p) => acc + p.stock, 0);
    const totalProductValue = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
    const totalMaterialValue = materials.reduce((acc, m) => acc + (m.price * m.stock), 0); // Assuming 'price' is cost per unit for materials
    const totalValue = totalProductValue + totalMaterialValue;
    const lowStockCount = materials.filter(m => m.stock <= m.minStock).length;

    // Mock data for "Stock Flow" (Area Chart) - More dynamic mock
    const flowData = [
        { name: 'S-6', entrada: 40, saida: 24 },
        { name: 'S-5', entrada: 30, saida: 13 },
        { name: 'S-4', entrada: 20, saida: 38 },
        { name: 'S-3', entrada: 27, saida: 39 },
        { name: 'S-2', entrada: 18, saida: 48 },
        { name: 'S-1', entrada: 23, saida: 38 },
        { name: 'ATUAL', entrada: 34, saida: 43 },
    ];

    // 2. Material Levels vs Min Stock (Bar Chart) - Now handles all materials
    const materialData = useMemo(() => {
        return (materials || []).map(m => ({
            name: (m.name || 'Item').toUpperCase().substring(0, 15),
            atual: m.stock || 0,
            minimo: m.minStock || 0
        })).sort((a, b) => b.atual - a.atual);
    }, [materials]);

    // 3. Product Distribution (Pie Chart) - Adaptive grouping
    const pieData = useMemo(() => {
        const sorted = [...products].sort((a, b) => b.stock - a.stock);
        const topCount = 5;
        const top = sorted.slice(0, topCount).map(p => ({ name: p.name.toUpperCase(), value: p.stock }));
        const othersValue = sorted.slice(topCount).reduce((acc, p) => acc + p.stock, 0);

        if (othersValue > 0) {
            top.push({ name: 'DEMAIS', value: othersValue });
        }
        return top;
    }, [products]);

    // Neon Brutalist Palette
    const COLORS = ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0000', '#FFFFFF'];

    return (
        <div className="w-full h-full flex flex-col pb-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-primary pb-4 gap-4 animate-fade-in-up">
                <div className="flex-1 min-w-0">
                    <h1 className="text-black dark:text-white text-4xl md:text-7xl font-black tracking-[-0.05em] uppercase leading-none transition-colors truncate">
                        Estoques
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-2 text-[10px] md:text-sm">
                        Inteligência de Armazenamento
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] shrink-0 border-2 border-transparent">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Custo Total (Produtos Prontos)</p>
                        <p className="text-xl md:text-2xl font-black tabular-nums tracking-tighter text-blue-400 dark:text-blue-600">R$ {totalProductValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] shrink-0 border-2 border-transparent">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Custo Total (Insumos)</p>
                        <p className="text-xl md:text-2xl font-black tabular-nums tracking-tighter text-purple-400 dark:text-purple-600">R$ {totalMaterialValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </header>

            {/* KPI MODULES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white p-4 md:p-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] animate-fade-in-up stagger-1">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Produtos Acabados</span>
                        <div className="size-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">inventory_2</span>
                        </div>
                    </div>
                    <p className="text-5xl font-black text-black dark:text-white leading-none tracking-tighter mb-2">{totalProductStock}</p>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-[10px] font-bold uppercase text-primary mt-2">Unidades em Pronta Entrega</p>
                </div>

                <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white p-4 md:p-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] animate-fade-in-up stagger-2">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Variedade de Insumos</span>
                        <div className="size-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">forest</span>
                        </div>
                    </div>
                    <p className="text-5xl font-black text-black dark:text-white leading-none tracking-tighter mb-2">{materials.length}</p>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-full bg-black dark:bg-white" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mt-2">Matérias-Primas Ativas</p>
                </div>

                <div className={`bg-white dark:bg-[#111] border-4 ${lowStockCount > 0 ? 'border-red-500 shadow-[6px_6px_0px_0px_#EF4444]' : 'border-green-500 shadow-[6px_6px_0px_0px_#22C55E]'} p-4 md:p-6 animate-fade-in-up stagger-3`}>
                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>Status Crítico</span>
                        <div className={`size-10 flex items-center justify-center ${lowStockCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'}`}>
                            <span className="material-symbols-outlined text-xl">
                                {lowStockCount > 0 ? 'warning' : 'check_circle'}
                            </span>
                        </div>
                    </div>
                    <p className={`text-5xl font-black leading-none tracking-tighter mb-2 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>{lowStockCount}</p>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
                        <div className={`h-full ${lowStockCount > 0 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: '100%' }}></div>
                    </div>
                    <p className={`text-[10px] font-bold uppercase mt-2 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {lowStockCount > 0 ? 'Reposição Necessária' : 'Estoque Saudável'}
                    </p>
                </div>
            </div>

            {/* CHARTS CONTAINER - "WINDOWS" STYLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* AREA CHART */}
                <div className="lg:col-span-2 bg-white dark:bg-[#050505] border-4 border-black dark:border-white animate-fade-in-up stagger-4 flex flex-col">
                    <div className="bg-black dark:bg-white text-white dark:text-black p-2 flex justify-between items-center px-4">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Fluxo de Movimentação</span>
                        <span className="material-symbols-outlined text-sm">show_chart</span>
                    </div>
                    <div className="h-[300px] md:h-[350px] w-full p-2 md:p-4 relative">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={flowData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#00FFFF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF00FF" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#FF00FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke={chartAxisColor} tick={{ fill: chartTickColor, fontSize: 9, fontWeight: 'bold' }} axisLine={false} />
                                <YAxis stroke={chartAxisColor} tick={{ fill: chartTickColor, fontSize: 9, fontWeight: 'bold' }} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }} iconType="square" />
                                <Area type="monotone" dataKey="entrada" name="ENTRADA" stroke="#00FFFF" strokeWidth={3} fillOpacity={1} fill="url(#colorEntrada)" />
                                <Area type="monotone" dataKey="saida" name="SAÍDA" stroke="#FF00FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSaida)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PIE CHART */}
                <div className="bg-white dark:bg-[#050505] border-4 border-black dark:border-white animate-fade-in-up stagger-4 flex flex-col">
                    <div className="bg-black dark:bg-white text-white dark:text-black p-2 flex justify-between items-center px-4">
                        <span className="text-xs font-black uppercase tracking-widest">Distribuição (Top 5)</span>
                        <span className="material-symbols-outlined text-sm">pie_chart</span>
                    </div>
                    <div className="h-[250px] w-full flex items-center justify-center p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                {/* Inner Label */}
                                <text x="50%" y="50%" dy={-10} textAnchor="middle" fill={isDark ? "white" : "black"} className="text-3xl font-black" style={{ fontSize: '24px', fontWeight: 900 }}>
                                    {totalProductStock}
                                </text>
                                <text x="50%" y="50%" dy={15} textAnchor="middle" fill="#888" className="text-xs font-bold uppercase">
                                    Total
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Styled Grid Legend */}
                    <div className="mt-auto grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-800">
                        {pieData.map((entry, index) => (
                            <div key={index} className="bg-white dark:bg-[#111] p-2 flex items-center gap-2">
                                <div className="size-2 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold uppercase text-gray-500 truncate">{entry.name}</p>
                                    <p className="text-xs font-black text-black dark:text-white">{entry.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PRODUCTS ANALYSIS CHART */}
            <div className="bg-white dark:bg-[#050505] border-4 border-black dark:border-white p-0 animate-fade-in-up stagger-4 mb-8">
                <div className="bg-black dark:bg-white text-white dark:text-black p-3 flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined">analytics</span>
                        Análise de Produtos Finalizados
                    </span>
                </div>
                <div className="h-[400px] w-full p-2 md:p-8 overflow-x-auto custom-scrollbar">
                    <div className="h-full border-4 border-black dark:border-white p-2 md:p-4 bg-white dark:bg-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(0,102,255,0.2)] relative"
                        style={{ minWidth: Math.max(100, products.length * 10) + '%' }}>

                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={products.map(p => ({
                                    name: p.name.toUpperCase().substring(0, 15),
                                    atual: p.stock,
                                    minimo: p.minStock || 5
                                })).sort((a, b) => b.atual - a.atual)}
                                margin={{ top: 40, right: 30, left: -20, bottom: 40 }}
                                barGap={8}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#e5e5e5'} />
                                <XAxis
                                    dataKey="name"
                                    stroke={chartAxisColor}
                                    tick={{ fill: chartTickColor, fontSize: 10, fontWeight: '900' }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    axisLine={{ strokeWidth: 4 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke={chartAxisColor}
                                    tick={{ fill: chartTickColor, fontSize: 10, fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="rect"
                                    wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', paddingBottom: '20px' }}
                                />
                                <Bar
                                    dataKey="atual"
                                    name="ESTOQUE ATUAL"
                                    fill="#0066FF"
                                    barSize={40}
                                    stroke="#000"
                                    strokeWidth={2}
                                />
                                <Bar
                                    dataKey="minimo"
                                    name="ESTOQUE MÍN"
                                    fill="#A020F0"
                                    barSize={15}
                                    fillOpacity={0.6}
                                    stroke="#000"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION - MATERIALS */}
            <div className="bg-white dark:bg-[#050505] border-4 border-primary p-0 animate-fade-in-up stagger-4">
                <div className="bg-primary text-white p-3 flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined">bar_chart</span>
                        Análise de Níveis de Insumo
                    </span>
                </div>
                <div className="h-[500px] md:h-[400px] w-full p-2 md:p-8 overflow-x-auto custom-scrollbar">
                    <div className="h-full border-4 border-black dark:border-white p-2 md:p-4 bg-white dark:bg-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] relative"
                        style={{ minWidth: Math.max(100, materialData.length * 6) + '%' }}>
                        {/* Efeito de Grid Industrial de Fundo */}
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={materialData}
                                margin={{ top: 40, right: 30, left: -20, bottom: 40 }}
                                barGap={8}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#e5e5e5'} />
                                <XAxis
                                    dataKey="name"
                                    stroke={chartAxisColor}
                                    tick={{ fill: chartTickColor, fontSize: 10, fontWeight: '900' }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    axisLine={{ strokeWidth: 4 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke={chartAxisColor}
                                    tick={{ fill: chartTickColor, fontSize: 10, fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="rect"
                                    wrapperStyle={{
                                        fontSize: '9px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase',
                                        paddingBottom: '20px',
                                        letterSpacing: '0.1em'
                                    }}
                                />
                                <Bar
                                    dataKey="atual"
                                    name="DISPONÍVEL"
                                    fill="#00FFFF"
                                    barSize={window.innerWidth < 768 ? 20 : 40}
                                    stroke="#000"
                                    strokeWidth={2}
                                />
                                <Bar
                                    dataKey="minimo"
                                    name="MÍNIMO"
                                    fill="#FF0000"
                                    barSize={window.innerWidth < 768 ? 10 : 15}
                                    fillOpacity={0.6}
                                    stroke="#000"
                                    strokeWidth={1}
                                />
                                {materialData.length > 15 && (
                                    <Brush dataKey="name" height={20} stroke="#00FFFF" fill="#000" />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
