
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TimeRange } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, LineChart, Line, Cell, Legend, YAxis, CartesianGrid, ComposedChart, PieChart, Pie } from 'recharts';

// Formatters
const formatCurrencyShort = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
};

const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Custom Tooltip for Finance Chart
const FinancialTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] z-50">
                <p className="text-black dark:text-white font-black uppercase text-sm mb-2 border-b-2 border-gray-200 dark:border-gray-800 pb-1">{label}</p>
                <div className="flex flex-col gap-1 font-mono text-xs">
                    <div className="flex justify-between gap-4">
                        <span className="text-[#0000FF] font-bold uppercase">Entrada:</span>
                        <span className="text-black dark:text-white font-bold">{formatCurrencyFull(payload.find((p: any) => p.dataKey === 'faturamento')?.value || 0)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-[#FF0000] font-bold uppercase">Saída (Custo):</span>
                        <span className="text-black dark:text-white font-bold">{formatCurrencyFull(payload.find((p: any) => p.dataKey === 'custo')?.value || 0)}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-400 my-1"></div>
                    <div className="flex justify-between gap-4 items-center bg-gray-100 dark:bg-white/10 p-1">
                        <span className="text-[#00FF00] font-black uppercase">Lucro:</span>
                        <span className="text-black dark:text-white font-black">{formatCurrencyFull(payload.find((p: any) => p.dataKey === 'lucro')?.value || 0)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { orders, products, materials, settings, deleteOrder, timeRange, setTimeRange } = useApp();
    const isDark = settings.appearance.theme === 'Escuro';
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300);
    }, []);

    // --- FILTER LOGIC ---
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            // Normalize order date to start of day for comparison
            const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

            switch (timeRange) {
                case 'HOJE':
                    return orderDay.getTime() === today.getTime();
                case '7D':
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 7);
                    return orderDay >= sevenDaysAgo;
                case 'MES':
                    return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
                case 'ANO':
                    return orderDate.getFullYear() === today.getFullYear();
                case 'TUDO':
                default:
                    return true;
            }
        });
    }, [orders, timeRange]);

    // --- CLOCK ---
    const [currentDate, setCurrentDate] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    const dateString = currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const timeString = currentDate.toLocaleTimeString('pt-BR');

    // --- KPIS ---
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(o => o.status === 'PENDENTE').length;
    const lateOrders = filteredOrders.filter(o => o.status === 'ATRASADO').length;
    const completedOrders = filteredOrders.filter(o => o.status === 'CONCLUÍDO').length;

    const lowStockProducts = products.filter(p => p.stock <= 5).length;
    const lowStockMaterials = materials.filter(m => m.stock <= m.minStock).length;

    // --- SALES CHANNELS ---
    const onlineOrders = filteredOrders.filter(o => o.origin === 'ONLINE');
    const physicalOrders = filteredOrders.filter(o => !o.origin || o.origin === 'FISICO');

    const calcProfit = (orderList: typeof orders) => {
        let profit = 0;
        orderList.forEach(order => {
            let orderCost = 0;
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const unitCost = product ? product.cost : (item.unitPrice * 0.6);
                orderCost += (unitCost * item.quantity);
            });
            profit += (order.totalValue - orderCost);
        });
        return profit;
    };

    const onlineProfit = calcProfit(onlineOrders);
    const physicalProfit = calcProfit(physicalOrders);

    // --- FINANCIAL DATA ---
    const { chartData, totals, realizedProfit } = useMemo(() => {
        const grouped: Record<string, { name: string, faturamento: number, custo: number, lucro: number, sortDate: number }> = {};
        let totalFat = 0, totalCusto = 0, totalLucro = 0, totalRealized = 0;

        filteredOrders.forEach(order => {
            const date = new Date(order.createdAt);
            let key, name;

            if (timeRange === 'HOJE' || timeRange === '7D' || timeRange === 'MES') {
                key = `${date.getDate()}/${date.getMonth()}`;
                name = `${date.getDate()}/${date.getMonth() + 1}`;
            } else {
                key = `${date.getFullYear()}-${date.getMonth()}`;
                name = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
            }

            if (!grouped[key]) grouped[key] = { name, faturamento: 0, custo: 0, lucro: 0, sortDate: date.getTime() };

            grouped[key].faturamento += order.totalValue;
            totalFat += order.totalValue;

            let orderCost = 0;
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const unitCost = product ? product.cost : (item.unitPrice * 0.6);
                orderCost += (unitCost * item.quantity);
            });

            grouped[key].custo += orderCost;
            totalCusto += orderCost;

            const p = order.totalValue - orderCost;
            grouped[key].lucro += p;
            totalLucro += p;

            if (order.status === 'CONCLUÍDO') totalRealized += p;
        });

        return {
            chartData: Object.values(grouped).sort((a, b) => a.sortDate - b.sortDate),
            totals: { faturamento: totalFat, custo: totalCusto, lucro: totalLucro },
            realizedProfit: totalRealized
        };
    }, [filteredOrders, products, timeRange]);

    // --- STATUS DONUT DATA ---
    const statusData = [
        { name: 'Pendente', value: pendingOrders, fill: '#FFFF00' },
        { name: 'Atrasado', value: lateOrders, fill: '#FF0000' },
        { name: 'Concluído', value: completedOrders, fill: '#00FF00' },
    ].filter(d => d.value > 0);

    const chartAxisColor = isDark ? '#888' : '#666';

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Excluir pedido do histórico?")) {
            deleteOrder(id);
        }
    };

    // Helper for KPI Cards
    const calculatePercent = (val: number) => totalOrders > 0 ? (val / totalOrders) * 100 : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-8">

            {/* 1. COMMAND CENTER HEADER */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-0 animate-fade-in-up">

                {/* Linha Superior: Identidade & Monitor do Sistema */}
                <div className="flex flex-col border-4 border-black dark:border-white bg-white dark:bg-[#1A1A1A] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                    {/* Logo & Name Area */}
                    <div className="p-4 md:p-6 flex flex-row items-center gap-4 md:gap-8 border-b-4 border-black dark:border-white relative overflow-hidden bg-white dark:bg-[#1A1A1A]">
                        {/* Decoration Background */}
                        <div className="absolute top-0 right-0 p-2 opacity-[0.03] pointer-events-none">
                            <span className="material-symbols-outlined text-8xl md:text-[120px]">precision_manufacturing</span>
                        </div>

                        <div className="relative z-10 shrink-0">
                            {settings.company.logo ? (
                                <div className="size-20 md:size-32 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#0000FF] p-1 flex items-center justify-center">
                                    <img src={settings.company.logo} alt="Logo" className="h-full w-auto object-contain" />
                                </div>
                            ) : (
                                <div className="size-20 md:size-32 bg-black dark:bg-white flex items-center justify-center border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_#0000FF]">
                                    <span className="material-symbols-outlined text-white dark:text-black text-4xl md:text-6xl">factory</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col relative z-10 flex-1 min-w-0">
                            <h1 className="text-black dark:text-white text-2xl md:text-4xl font-black uppercase tracking-[-0.05em] leading-[0.9] break-words">
                                {settings.company.name || 'DASHBOARD'}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 border border-green-500/20 rounded-full">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-[9px] md:text-xs font-black uppercase tracking-wider">Sistema Online</span>
                                </span>
                                <span className="text-[10px] md:text-xs font-bold uppercase text-gray-500 tracking-widest hidden sm:inline">v2.5 // CORE_ENGINE</span>
                            </div>
                        </div>
                    </div>

                    {/* System Monitor (Relógio & Status) */}
                    <div className="bg-black text-white p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,_rgba(0,0,255,0.4),transparent)] pointer-events-none"></div>

                        <div className="relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 block mb-1">DATA DO SISTEMA</span>
                            <span className="text-sm md:text-base font-black uppercase tracking-tighter opacity-80">{dateString}</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-start md:items-end">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 block mb-1">HORÁRIO LOCAL</span>
                            <span className="font-mono text-4xl md:text-6xl font-black tracking-tighter tabular-nums leading-none">
                                {timeString}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Segunda Linha: Barra de Ajuste (Filtros) - Estilo Orders Page */}
                <div className="bg-white dark:bg-black border-x-4 border-b-4 border-black dark:border-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex-1 w-full grid grid-cols-5 bg-gray-100 dark:bg-[#111] p-1 border-2 border-black dark:border-white">
                            {(['HOJE', '7D', 'MES', 'ANO', 'TUDO'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`
                                        py-2 text-[10px] font-black uppercase transition-all duration-200
                                        ${timeRange === range
                                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_#0000FF]'
                                            : 'text-gray-500 hover:text-black dark:hover:text-white'}
                                    `}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-l-2 border-gray-200 dark:border-gray-800 h-10">
                            <span className="material-symbols-outlined text-sm">filter_alt</span>
                            Parâmetros Globais
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MÓDULOS DE KPI (Cards Industriais) */}
            <div className="col-span-1 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">

                {/* FLUXO TOTAL */}
                <div className="relative bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] group overflow-hidden">
                    <div className="absolute right-0 top-0 p-1 opacity-10">
                        <span className="material-symbols-outlined text-4xl">receipt_long</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Pedidos</span>
                        <span className="text-3xl md:text-5xl font-black text-black dark:text-white leading-none tracking-tighter">{totalOrders}</span>
                    </div>
                </div>

                {/* PENDENTES */}
                <div className="relative bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_#FFFF00] group overflow-hidden">
                    <div className="absolute right-0 top-0 p-1 opacity-10">
                        <span className="material-symbols-outlined text-4xl text-yellow-500">pending</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Pendentes</span>
                        <span className="text-3xl md:text-5xl font-black text-black dark:text-white leading-none tracking-tighter">{pendingOrders}</span>
                    </div>
                </div>

                {/* ATRASADOS */}
                <div className={`relative bg-white dark:bg-[#1A1A1A] border-4 ${lateOrders > 0 ? 'border-red-500 shadow-[4px_4px_0px_0px_#FF0000]' : 'border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'} p-4 transition-all duration-300 group overflow-hidden`}>
                    <div className="absolute right-0 top-0 p-1 opacity-10">
                        <span className={`material-symbols-outlined text-4xl ${lateOrders > 0 ? 'text-red-500' : ''}`}>warning</span>
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${lateOrders > 0 ? 'text-red-500' : 'text-gray-400'} mb-1`}>Críticos</span>
                        <span className={`text-3xl md:text-5xl font-black leading-none tracking-tighter ${lateOrders > 0 ? 'text-red-500' : 'text-black dark:text-white'}`}>{lateOrders}</span>
                    </div>
                </div>

                {/* CONCLUÍDOS */}
                <div className="relative bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_#00FF00] group overflow-hidden">
                    <div className="absolute right-0 top-0 p-1 opacity-10">
                        <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Concluídos</span>
                        <span className="text-3xl md:text-5xl font-black text-black dark:text-white leading-none tracking-tighter">{completedOrders}</span>
                    </div>
                </div>
            </div>

            {/* 3. COLUNA DE MÉTRICAS E GRÁFICOS */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
                {/* FINANCEIRO */}
                <div className="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-4 animate-fade-in-up stagger-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
                        <h3 className="text-black dark:text-white text-sm font-black uppercase flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Fluxo Financeiro
                        </h3>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-400 uppercase">Receita</p>
                                <p className="text-xs font-black text-blue-600">{formatCurrencyShort(totals.faturamento)}</p>
                            </div>
                            <div className="text-right border-l-2 border-gray-200 dark:border-gray-800 pl-4">
                                <p className="text-[8px] font-black text-gray-400 uppercase">Lucro</p>
                                <p className="text-xs font-black text-green-600">{formatCurrencyShort(totals.lucro)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#e5e5e5'} />
                                <XAxis dataKey="name" stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 8, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 8, fontWeight: 'bold' }} tickFormatter={formatCurrencyShort} axisLine={false} tickLine={false} />
                                <Tooltip content={<FinancialTooltip />} />
                                <Bar dataKey="faturamento" fill="#0000FF" barSize={12} radius={[2, 2, 0, 0]} />
                                <Line type="monotone" dataKey="lucro" stroke="#00FF00" strokeWidth={3} dot={{ r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CANAIS E STATUS (COLUNA DUPLA NO DESKTOP, STACK NO MOBILE) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CANAIS */}
                    <div className="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
                            <span className="material-symbols-outlined text-primary text-lg">public</span>
                            <h3 className="text-black dark:text-white text-xs font-black uppercase">Canais</h3>
                        </div>
                        <div className="flex justify-around items-center h-24">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-black dark:text-white">{onlineOrders.length}</span>
                                <span className="text-[8px] font-black uppercase text-cyan-500">Online</span>
                            </div>
                            <div className="w-px h-12 bg-gray-200 dark:border-gray-800"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-black dark:text-white">{physicalOrders.length}</span>
                                <span className="text-[8px] font-black uppercase text-orange-500">Físico</span>
                            </div>
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
                            <span className="material-symbols-outlined text-primary text-lg">donut_small</span>
                            <h3 className="text-black dark:text-white text-xs font-black uppercase">Status</h3>
                        </div>
                        <div className="h-24 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={25} outerRadius={35} paddingAngle={5} dataKey="value" stroke="none">
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-black text-black dark:text-white">{totalOrders}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. ATIVIDADE RECENTE (LISTA ESTILO ORDERS PAGE) */}
            <div className="col-span-1 lg:col-span-2 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                <div className="bg-black text-white p-3 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">monitoring</span>
                        Log de Atividade
                    </h3>
                    <button onClick={() => navigate('/pedidos')} className="text-[10px] font-black uppercase bg-blue-600 px-2 py-1 hover:bg-white hover:text-black transition-colors">
                        Ver Tudo
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar max-h-[600px]">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 opacity-30">
                            <span className="material-symbols-outlined text-5xl">inventory</span>
                            <p className="text-xs font-black uppercase mt-2">Nenhuma atividade</p>
                        </div>
                    ) : (
                        filteredOrders.slice(0, 10).map((order) => (
                            <div key={order.id} className="border-2 border-black dark:border-white bg-white dark:bg-black p-3 hover:shadow-[4px_4px_0px_0px_#0000FF] transition-all cursor-pointer group" onClick={() => navigate('/pedidos')}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">#{order.id.substring(0, 8)}</p>
                                        <p className="text-sm font-black text-black dark:text-white uppercase line-clamp-1">{order.client}</p>
                                    </div>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 border-2 border-black dark:border-white uppercase
                                        ${order.status === 'ATRASADO' ? 'bg-red-500 text-white' :
                                            order.status === 'CONCLUÍDO' ? 'bg-green-500 text-black' :
                                                'bg-yellow-400 text-black'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="flex gap-1 overflow-hidden">
                                        {order.items.slice(0, 2).map((item, i) => (
                                            <span key={i} className="text-[9px] font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 border border-black/10 dark:border-white/10 uppercase truncate max-w-[80px]">
                                                {item.productName}
                                            </span>
                                        ))}
                                        {order.items.length > 2 && <span className="text-[9px] font-bold text-gray-400">+{order.items.length - 2}</span>}
                                    </div>
                                    <p className="font-mono text-sm font-black text-black dark:text-white">
                                        {formatCurrencyFull(order.totalValue)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};
