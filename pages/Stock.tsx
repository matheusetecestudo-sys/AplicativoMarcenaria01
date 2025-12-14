
import React from 'react';
import { useApp } from '../context/AppContext';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
    AreaChart, Area, PieChart, Pie, Cell, ReferenceLine
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
  const totalValue = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
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

  // Material Levels vs Min Stock (Bar Chart)
  const materialData = materials.slice(0, 8).map(m => ({ // Limit to 8 for cleanliness
      name: m.name.split(' ')[0], // Short name
      atual: m.stock,
      minimo: m.minStock
  }));

  // Product Distribution (Pie Chart)
  const pieData = products.map(p => ({
      name: p.name,
      value: p.stock
  }));

  // Neon Brutalist Palette
  const COLORS = ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0000'];

  return (
    <div className="w-full h-full flex flex-col pb-8">
        <header className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-4 border-primary pb-4 animate-fade-in-up">
            <div>
                <h1 className="text-black dark:text-white text-5xl md:text-7xl font-black tracking-[-0.05em] uppercase leading-none transition-colors">
                    Estoques
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-2 text-xs md:text-sm">
                    Inteligência de Armazenamento
                </p>
            </div>
            <div className="text-right mt-4 md:mt-0 bg-black dark:bg-white text-white dark:text-black px-4 py-2 shadow-[4px_4px_0px_0px_#0000FF]">
                <p className="text-[10px] font-black uppercase tracking-widest">Valor Estimado</p>
                <p className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
        </header>

        {/* KPI MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white p-6 relative overflow-hidden group animate-fade-in-up stagger-1">
                <div className="absolute right-[-10px] top-[-10px] size-20 bg-gray-100 dark:bg-[#222] rounded-full z-0 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Acabados</span>
                        <span className="material-symbols-outlined text-primary">inventory_2</span>
                    </div>
                    <p className="text-5xl font-black text-black dark:text-white leading-none tracking-tighter">{totalProductStock}</p>
                    <p className="text-xs font-bold uppercase text-primary mt-2">Unidades Prontas</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white p-6 relative overflow-hidden group animate-fade-in-up stagger-2">
                <div className="absolute right-[-10px] top-[-10px] size-20 bg-gray-100 dark:bg-[#222] rounded-full z-0 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Insumos</span>
                        <span className="material-symbols-outlined text-black dark:text-white">forest</span>
                    </div>
                    <p className="text-5xl font-black text-black dark:text-white leading-none tracking-tighter">{materials.length}</p>
                    <p className="text-xs font-bold uppercase text-gray-500 mt-2">Tipos Cadastrados</p>
                </div>
            </div>

            <div className={`bg-white dark:bg-[#111] border-4 ${lowStockCount > 0 ? 'border-red-500' : 'border-green-500'} p-6 relative overflow-hidden group animate-fade-in-up stagger-3`}>
                <div className={`absolute right-[-10px] top-[-10px] size-20 rounded-full z-0 group-hover:scale-150 transition-transform duration-500 ${lowStockCount > 0 ? 'bg-red-900/10' : 'bg-green-900/10'}`}></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>Status</span>
                         <span className={`material-symbols-outlined ${lowStockCount > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                            {lowStockCount > 0 ? 'warning' : 'check_circle'}
                         </span>
                    </div>
                    <p className={`text-5xl font-black leading-none tracking-tighter ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>{lowStockCount}</p>
                    <p className={`text-xs font-bold uppercase mt-2 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {lowStockCount > 0 ? 'Itens Críticos' : 'Operação Normal'}
                    </p>
                </div>
            </div>
        </div>

        {/* CHARTS CONTAINER - "WINDOWS" STYLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* AREA CHART */}
            <div className="lg:col-span-2 bg-white dark:bg-[#050505] border-4 border-black dark:border-white animate-fade-in-up stagger-4 flex flex-col">
                <div className="bg-black dark:bg-white text-white dark:text-black p-2 flex justify-between items-center px-4">
                    <span className="text-xs font-black uppercase tracking-widest">Fluxo de Movimentação (Semanas)</span>
                    <span className="material-symbols-outlined text-sm">show_chart</span>
                </div>
                <div className="h-[350px] w-full p-4 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={flowData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF00FF" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#FF00FF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke={chartAxisColor} tick={{fill: chartTickColor, fontSize: 10, fontWeight: 'bold'}} axisLine={false} />
                            <YAxis stroke={chartAxisColor} tick={{fill: chartTickColor, fontSize: 10, fontWeight: 'bold'}} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} iconType="square" />
                            <Area type="monotone" dataKey="entrada" name="ENTRADA (COMPRA)" stroke="#00FFFF" strokeWidth={3} fillOpacity={1} fill="url(#colorEntrada)" activeDot={{r: 6, fill: 'white'}} />
                            <Area type="monotone" dataKey="saida" name="SAÍDA (VENDA)" stroke="#FF00FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSaida)" activeDot={{r: 6, fill: 'white'}} />
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
                            <text x="50%" y="50%" dy={-10} textAnchor="middle" fill={isDark ? "white" : "black"} className="text-3xl font-black" style={{fontSize: '24px', fontWeight: 900}}>
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
                    {pieData.slice(0, 4).map((entry, index) => (
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

        {/* BOTTOM SECTION */}
        <div className="bg-white dark:bg-[#050505] border-4 border-primary p-0 animate-fade-in-up stagger-4">
             <div className="bg-primary text-white p-3 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined">bar_chart</span>
                    Análise de Níveis de Insumo
                </span>
             </div>
             <div className="h-[300px] w-full p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={materialData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barGap={0}
                    >
                        <XAxis dataKey="name" stroke={chartAxisColor} tick={{fill: chartTickColor, fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis stroke={chartAxisColor} tick={{fill: chartTickColor, fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} />
                        <Legend wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px'}} />
                        <Bar dataKey="atual" name="ESTOQUE ATUAL" fill="#00FFFF" barSize={30} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="minimo" name="NÍVEL MÍNIMO" fill="#FF0000" barSize={10} radius={[4, 4, 0, 0]} fillOpacity={0.5} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
    </div>
  );
};
