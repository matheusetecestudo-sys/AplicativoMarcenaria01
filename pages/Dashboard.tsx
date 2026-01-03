
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

                {/* Top Row: Identity & System Monitor */}
                <div className="grid grid-cols-1 md:grid-cols-12 border-4 border-black dark:border-white bg-white dark:bg-[#1A1A1A]">

                    {/* Logo & Name Area */}
                    <div className="md:col-span-7 lg:col-span-8 p-4 md:p-6 flex items-center gap-6 border-b-4 md:border-b-0 md:border-r-4 border-black dark:border-white relative overflow-hidden">
                        {/* Decoration Background */}
                        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                            <span className="material-symbols-outlined text-9xl">factory</span>
                        </div>

                        <div className="relative z-10 shrink-0">
                            {settings.company.logo ? (
                                <div className="size-24 md:size-32 bg-white border-4 border-primary shadow-[4px_4px_0px_0px_#FFF] dark:shadow-[4px_4px_0px_0px_#333] p-1">
                                    <img src={settings.company.logo} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <div className="size-24 md:size-32 bg-primary flex items-center justify-center border-4 border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]">
                                    <span className="material-symbols-outlined text-white text-6xl">precision_manufacturing</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col relative z-10">
                            <h1 className="text-black dark:text-white text-2xl md:text-3xl font-black uppercase tracking-[-0.05em] leading-tight line-clamp-2 break-words">
                                {settings.company.name || 'DASHBOARD'}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-[0.3em]">
                                    Operação Ativa
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* System Monitor (Clock & Status) */}
                    <div className="md:col-span-5 lg:col-span-4 bg-black dark:bg-white text-white dark:text-black p-4 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-500 via-black to-black pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Time</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{dateString}</span>
                        </div>

                        <div className="relative z-10 text-right">
                            <span className="font-mono text-5xl md:text-6xl font-black tracking-tighter tabular-nums leading-none block">
                                {timeString}
                            </span>
                        </div>

                        <div className="mt-2 border-t border-gray-700 dark:border-gray-300 pt-2 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">database</span>
                                <span className="text-[10px] font-bold uppercase">DB: Conectado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase">Versão 2.5</span>
                                <span className="material-symbols-outlined text-sm">verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second Row: Tuner Bar (Filters) */}
                <div className="bg-gray-100 dark:bg-[#0A0A0A] border-x-4 border-b-4 border-black dark:border-white p-2">
                    <div className="flex flex-wrap md:flex-nowrap gap-2 justify-between items-center">
                        <span className="hidden md:flex items-center gap-2 px-4 text-xs font-black uppercase text-gray-400 tracking-widest">
                            <span className="material-symbols-outlined text-sm">tune</span>
                            Filtro Temporal
                        </span>

                        <div className="flex flex-1 bg-white dark:bg-black border-2 border-black dark:border-white">
                            {(['HOJE', '7D', 'MES', 'ANO', 'TUDO'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`
                                flex-1 py-3 text-xs font-black uppercase transition-all duration-200 relative overflow-hidden group
                                ${timeRange === range
                                            ? 'bg-primary text-white'
                                            : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'}
                            `}
                                >
                                    <span className="relative z-10">{range}</span>
                                    {timeRange === range && (
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-black dark:bg-white"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KPI MODULES (Industrial Cards) */}
            <div className="col-span-1 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up stagger-1">

                {/* TOTAL FLOW */}
                <div className="relative bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_#0000FF] hover:-translate-y-1 transition-transform group">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 border-primary"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 border-primary"></div>

                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Fluxo Total</span>
                        <span className="material-symbols-outlined text-primary group-hover:rotate-12 transition-transform">receipt_long</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-6xl font-black text-black dark:text-white leading-none tracking-tighter">{totalOrders}</span>
                        <span className="text-xs font-bold uppercase text-primary mt-1">Pedidos Registrados</span>
                    </div>
                </div>

                {/* PENDING */}
                <div className="relative bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-6 hover:border-[#FFFF00] transition-colors duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-[#FFFF00]">Em Aberto</span>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-[#FFFF00]">pending</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-6xl font-black text-black dark:text-white leading-none tracking-tighter group-hover:text-[#FFFF00] transition-colors">{pendingOrders}</span>
                        <div className="w-full bg-gray-100 dark:bg-black h-2 mt-2 border border-gray-300 dark:border-gray-700">
                            <div className="h-full bg-[#FFFF00]" style={{ width: `${calculatePercent(pendingOrders)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* LATE (ALERT) */}
                <div className={`relative bg-white dark:bg-[#1A1A1A] border-4 ${lateOrders > 0 ? 'border-[#FF0000]' : 'border-black dark:border-white'} p-6 transition-colors duration-300 group`}>
                    {lateOrders > 0 && <div className="absolute inset-0 border-4 border-[#FF0000] animate-pulse pointer-events-none opacity-50"></div>}

                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${lateOrders > 0 ? 'text-[#FF0000]' : 'text-gray-400'}`}>Crítico</span>
                        <span className={`material-symbols-outlined ${lateOrders > 0 ? 'text-[#FF0000]' : 'text-gray-300'}`}>warning</span>
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-6xl font-black leading-none tracking-tighter ${lateOrders > 0 ? 'text-[#FF0000]' : 'text-black dark:text-white'}`}>{lateOrders}</span>
                        <div className="w-full bg-gray-100 dark:bg-black h-2 mt-2 border border-gray-300 dark:border-gray-700">
                            <div className="h-full bg-[#FF0000]" style={{ width: `${calculatePercent(lateOrders)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* COMPLETED */}
                <div className="relative bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-6 hover:border-[#00FF00] transition-colors duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-[#00FF00]">Finalizados</span>
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-[#00FF00]">check_circle</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-6xl font-black text-black dark:text-white leading-none tracking-tighter group-hover:text-[#00FF00] transition-colors">{completedOrders}</span>
                        <div className="w-full bg-gray-100 dark:bg-black h-2 mt-2 border border-gray-300 dark:border-gray-700">
                            <div className="h-full bg-[#00FF00]" style={{ width: `${calculatePercent(completedOrders)}%` }}></div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. SALES CHANNELS (RADIAL TURBINES) */}
            <div className="col-span-1 lg:col-span-2 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] animate-fade-in-up stagger-2">
                <div className="flex items-center gap-3 mb-6 border-b-4 border-black dark:border-white pb-2">
                    <span className="material-symbols-outlined text-primary text-3xl">public</span>
                    <div>
                        <h3 className="text-black dark:text-white text-xl font-black uppercase leading-none">Canais</h3>
                        <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Performance de Vendas</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* ONLINE TURBINE */}
                    <div className="flex flex-col items-center">
                        <div className="relative size-32 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800 opacity-30"></div>
                            <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#00FFFF" strokeWidth="12"
                                    strokeDasharray={`${(onlineOrders.length / (totalOrders || 1)) * 251} 251`}
                                    strokeLinecap="butt"
                                    className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-[#00FFFF] text-xl">wifi</span>
                                <span className="font-black text-xl text-black dark:text-white">{onlineOrders.length}</span>
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[#00FFFF] font-black uppercase text-sm">Internet</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{formatCurrencyShort(onlineProfit)} Lucro</p>
                        </div>
                    </div>

                    {/* PHYSICAL TURBINE */}
                    <div className="flex flex-col items-center">
                        <div className="relative size-32 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800 opacity-30"></div>
                            <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FFA500" strokeWidth="12"
                                    strokeDasharray={`${(physicalOrders.length / (totalOrders || 1)) * 251} 251`}
                                    strokeLinecap="butt"
                                    className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-[#FFA500] text-xl">storefront</span>
                                <span className="font-black text-xl text-black dark:text-white">{physicalOrders.length}</span>
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[#FFA500] font-black uppercase text-sm">Loja Física</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{formatCurrencyShort(physicalProfit)} Lucro</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. STATUS DONUT CHART */}
            <div className="col-span-1 lg:col-span-2 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-6 animate-fade-in-up stagger-2">
                <div className="flex items-center gap-3 mb-2 border-b-4 border-black dark:border-white pb-2">
                    <span className="material-symbols-outlined text-primary text-3xl">donut_small</span>
                    <div>
                        <h3 className="text-black dark:text-white text-xl font-black uppercase leading-none">Status</h3>
                        <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Distribuição por Estado</p>
                    </div>
                </div>

                <div className="h-48 w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '2px solid #FFF', color: '#FFF' }}
                                itemStyle={{ color: '#FFF', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black text-black dark:text-white leading-none">{totalOrders}</span>
                        <span className="text-[10px] font-bold uppercase text-gray-500">Total</span>
                    </div>
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-4 mt-2">
                    {statusData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <div className="size-3 rounded-full" style={{ backgroundColor: d.fill }}></div>
                            <span className="text-[10px] font-bold uppercase text-gray-500">{d.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. FINANCIAL CHART */}
            <div className="col-span-1 lg:col-span-4 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-6 animate-fade-in-up stagger-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                    <div>
                        <h3 className="text-black dark:text-white text-xl font-black uppercase flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">attach_money</span>
                            Fluxo Financeiro
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-gray-500">Faturamento</span>
                            <span className="text-blue-600 dark:text-blue-500 font-black text-lg">{formatCurrencyShort(totals.faturamento)}</span>
                        </div>
                        <div className="flex flex-col border-l-2 border-gray-300 dark:border-gray-700 pl-4">
                            <span className="text-[10px] font-bold uppercase text-gray-500">Lucro (Liq)</span>
                            <span className="text-green-600 dark:text-green-500 font-black text-lg">{formatCurrencyShort(totals.lucro)}</span>
                        </div>
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#e5e5e5'} />
                            <XAxis
                                dataKey="name"
                                stroke={chartAxisColor}
                                tick={{ fill: chartAxisColor, fontWeight: 'bold', fontSize: 10 }}
                                axisLine={false} tickLine={false} dy={10}
                            />
                            <YAxis
                                stroke={chartAxisColor}
                                tick={{ fill: chartAxisColor, fontWeight: 'bold', fontSize: 10 }}
                                tickFormatter={formatCurrencyShort}
                                axisLine={false} tickLine={false}
                            />
                            <Tooltip content={<FinancialTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />

                            <Bar dataKey="faturamento" fill="#0000FF" barSize={20} radius={[2, 2, 0, 0]} fillOpacity={0.9} />
                            <Bar dataKey="custo" fill="#FF0000" barSize={20} radius={[2, 2, 0, 0]} fillOpacity={0.8} />
                            <Line type="monotone" dataKey="lucro" stroke="#00FF00" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#00FF00', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 6. RECENT ORDERS LIST */}
            <div className="col-span-1 lg:col-span-4 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white animate-fade-in-up stagger-4">
                <div className="bg-primary p-3 border-b-4 border-black dark:border-white flex justify-between items-center">
                    <p className="text-white text-lg font-black uppercase">Pedidos Recentes ({filteredOrders.length})</p>
                    <button onClick={() => navigate('/pedidos')} className="text-xs bg-black text-white px-3 py-1 font-bold uppercase hover:bg-white hover:text-black transition-colors border border-transparent hover:border-black">
                        Gerenciar Todos
                    </button>
                </div>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="border-b-4 border-black dark:border-white text-black dark:text-white">
                            <tr>
                                <th className="p-3 uppercase font-black text-xs tracking-wider">Data</th>
                                <th className="p-3 uppercase font-black text-xs tracking-wider">Cliente</th>
                                <th className="p-3 uppercase font-black text-xs tracking-wider text-center">Status</th>
                                <th className="p-3 uppercase font-black text-xs tracking-wider text-right">Total</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                            {filteredOrders.slice(0, 5).map(order => (
                                <tr key={order.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-mono text-xs font-bold">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 font-bold text-sm uppercase">{order.client}</td>
                                    <td className="p-3 text-center">
                                        <span className={`font-black px-2 py-0.5 text-[10px] uppercase border border-black dark:border-white shadow-sm
                                    ${order.status === 'ATRASADO' ? 'bg-[#FF0000] text-white border-red-800' :
                                                order.status === 'CONCLUÍDO' ? 'bg-[#00FF00] text-black border-green-800' :
                                                    'bg-[#FFFF00] text-black border-yellow-600'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right font-black font-mono text-sm">R$ {order.totalValue.toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={(e) => handleDelete(e, order.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
