
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Material } from '../types';

export const Materials: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial, settings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'TODOS' | 'BAIXO' | 'CRITICO'>('TODOS');

  const [formData, setFormData] = useState<Partial<Material>>({
    name: '', unit: 'un', costPerUnit: 0, stock: 0, minStock: 0
  });

  // --- STATS CALCULATION ---
  const totalItems = materials.length;
  const totalValue = materials.reduce((acc, m) => acc + (m.stock * m.costPerUnit), 0);
  const criticalItems = materials.filter(m => m.stock <= m.minStock).length;

  const openModal = (material?: Material) => {
    if (material) {
        setEditingMaterial(material);
        setFormData(material);
    } else {
        setEditingMaterial(null);
        setFormData({ name: '', unit: 'un', costPerUnit: 0, stock: 0, minStock: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingMaterial(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
        updateMaterial({ ...editingMaterial, ...formData as Material });
    } else {
        addMaterial({
            id: Math.random().toString(36).substr(2, 9),
            ...formData as Material
        });
    }
    closeModal();
  };

  const filteredMaterials = useMemo(() => {
      return materials.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isLow = m.stock <= m.minStock;
        const isCritical = m.stock <= m.minStock / 2;

        if (!matchesSearch) return false;

        if (filterType === 'BAIXO') return isLow;
        if (filterType === 'CRITICO') return isCritical;
        return true;
      });
  }, [materials, searchTerm, filterType]);

  return (
    <div className="flex flex-col relative pb-8 min-h-full">
      
      {/* 1. INDUSTRIAL HEADER & METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 shrink-0">
         <div className="lg:col-span-1 flex flex-col justify-center">
            <h1 className="text-black dark:text-white text-4xl font-black leading-none tracking-[-0.05em] uppercase transition-colors">
                Insumos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-2 text-xs">
                Gestão de Matéria-Prima
            </p>
         </div>

         {/* Mini KPIs */}
         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1A1A1A] border-l-4 border-primary p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase text-gray-400">Valor em Estoque</p>
                <p className="text-2xl font-black text-black dark:text-white truncate font-mono">
                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] border-l-4 border-black dark:border-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase text-gray-400">Total de Itens</p>
                <p className="text-2xl font-black text-black dark:text-white font-mono">{totalItems}</p>
            </div>
            <div className={`bg-white dark:bg-[#1A1A1A] border-l-4 p-4 shadow-sm ${criticalItems > 0 ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-green-500'}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className={`text-[10px] font-black uppercase ${criticalItems > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            Alertas de Reposição
                        </p>
                        <p className={`text-2xl font-black font-mono ${criticalItems > 0 ? 'text-red-600' : 'text-black dark:text-white'}`}>
                            {criticalItems}
                        </p>
                    </div>
                    {criticalItems > 0 && <span className="material-symbols-outlined text-red-500 animate-pulse text-3xl">warning</span>}
                </div>
            </div>
         </div>
      </div>

      {/* 2. CONTROL BAR (Toolbar) */}
      <div className="flex flex-col xl:flex-row justify-between items-end gap-4 mb-6 bg-white dark:bg-[#1A1A1A] p-4 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
         
         {/* Filter Buttons */}
         <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
             {(['TODOS', 'BAIXO', 'CRITICO'] as const).map(type => (
                 <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`
                        px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all whitespace-nowrap brutal-btn
                        ${filterType === type 
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,255,1)] translate-y-[-2px]' 
                            : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white'
                        }
                    `}
                 >
                    {type === 'BAIXO' ? 'Estoque Baixo' : type === 'CRITICO' ? 'Crítico' : 'Todos os Itens'}
                 </button>
             ))}
         </div>

         <div className="flex gap-4 w-full xl:w-auto">
             <div className="relative flex-1 xl:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                <input 
                    type="text" 
                    placeholder="BUSCAR INSUMO..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border-2 border-gray-300 dark:border-gray-700 text-black dark:text-white font-bold uppercase focus:border-primary focus:outline-none transition-colors brutal-input text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
            <button 
                onClick={() => openModal()}
                className="flex items-center justify-center px-6 bg-primary text-white text-xs font-black uppercase border-2 border-transparent hover:brightness-110 transition-all brutal-btn shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] active:translate-y-[2px] active:shadow-none whitespace-nowrap gap-2"
            >
                <span className="material-symbols-outlined text-lg">add</span>
                <span>Novo Item</span>
            </button>
         </div>
      </div>

      {/* 3. HIGH DENSITY TABLE - IMPROVED READABILITY */}
      <div className="w-full overflow-x-auto border-4 border-black dark:border-white bg-white dark:bg-[#0A0A0A] shadow-lg">
        <table className="w-full text-left min-w-[900px] border-collapse">
            <thead className="bg-black dark:bg-white text-white dark:text-black">
                <tr>
                    <th className="p-4 text-[11px] font-black uppercase w-[30%] tracking-widest border-r border-gray-700 dark:border-gray-300">Especificação Técnica</th>
                    <th className="p-4 text-[11px] font-black uppercase w-[15%] tracking-widest border-r border-gray-700 dark:border-gray-300 text-right">Custo / UN</th>
                    <th className="p-4 text-[11px] font-black uppercase w-[35%] tracking-widest border-r border-gray-700 dark:border-gray-300">Nível de Estoque</th>
                    <th className="p-4 text-[11px] font-black uppercase w-[10%] text-center tracking-widest border-r border-gray-700 dark:border-gray-300">Estado</th>
                    <th className="p-4 text-[11px] font-black uppercase w-[10%] text-center tracking-widest">Controle</th>
                </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100 dark:divide-gray-900">
                {filteredMaterials.map((material) => {
                    const percentage = Math.min((material.stock / (material.minStock * 2)) * 100, 100);
                    const isLow = material.stock <= material.minStock;
                    const isCritical = material.stock <= material.minStock / 2;

                    return (
                        <tr 
                            key={material.id} 
                            className="hover:bg-blue-50 dark:hover:bg-white/5 transition-colors group bg-white dark:bg-[#111]"
                        >
                            {/* NAME & ID */}
                            <td className="p-5 border-r border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col gap-1">
                                    <span className="text-base font-black text-black dark:text-white uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                                        {material.name}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                         <span className="text-[10px] font-mono font-bold text-gray-400 uppercase bg-gray-100 dark:bg-black px-1.5 py-0.5 border border-gray-200 dark:border-gray-800">
                                            ID: {material.id.substring(0,6).toUpperCase()}
                                         </span>
                                         <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">
                                            UN: {material.unit}
                                         </span>
                                    </div>
                                </div>
                            </td>
                            
                            {/* COST */}
                            <td className="p-5 text-right border-r border-gray-100 dark:border-gray-800 align-middle">
                                <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200 block">
                                    R$ {material.costPerUnit.toFixed(2)}
                                </span>
                                <span className="text-[9px] text-gray-400 uppercase font-bold">Por Unidade</span>
                            </td>

                            {/* STOCK LEVEL (Industrial Bar) */}
                            <td className="p-5 border-r border-gray-100 dark:border-gray-800 align-middle">
                                <div className="flex flex-col gap-2 w-full max-w-[280px]">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-mono font-bold text-black dark:text-white">
                                            {material.stock} <span className="text-xs text-gray-500">{material.unit}</span>
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-gray-400">
                                            Min: {material.minStock}
                                        </span>
                                    </div>
                                    
                                    {/* Industrial Bar Container */}
                                    <div className="w-full h-5 bg-gray-100 dark:bg-[#222] border-2 border-black dark:border-white relative p-[2px] overflow-hidden">
                                        {/* Background Hatch Pattern */}
                                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
                                        
                                        {/* Fill Bar */}
                                        <div 
                                            className={`h-full transition-all duration-500 relative z-10
                                                ${isCritical 
                                                    ? 'bg-[#FF0000]' 
                                                    : isLow 
                                                        ? 'bg-[#FFA500]' 
                                                        : 'bg-[#00FF00]'
                                                }`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>

                            {/* STATUS BADGE */}
                            <td className="p-5 text-center border-r border-gray-100 dark:border-gray-800 align-middle">
                                {isCritical ? (
                                    <span className="inline-block px-2 py-1 bg-[#FF0000] text-white text-[10px] font-black uppercase tracking-wider border-2 border-[#990000] shadow-[2px_2px_0px_#990000]">
                                        Crítico
                                    </span>
                                ) : isLow ? (
                                    <span className="inline-block px-2 py-1 bg-[#FFFF00] text-black text-[10px] font-black uppercase tracking-wider border-2 border-[#bbaa00] shadow-[2px_2px_0px_#bbaa00]">
                                        Baixo
                                    </span>
                                ) : (
                                    <span className="inline-block px-2 py-1 bg-[#00FF00] text-black text-[10px] font-black uppercase tracking-wider border-2 border-[#009900] shadow-[2px_2px_0px_#009900]">
                                        Normal
                                    </span>
                                )}
                            </td>

                            {/* ACTIONS */}
                            <td className="p-5 text-center align-middle">
                                <div className="flex justify-center gap-2">
                                    <button 
                                        onClick={() => openModal(material)}
                                        className="size-9 flex items-center justify-center bg-gray-100 dark:bg-[#222] text-black dark:text-gray-300 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-black transition-all shadow-sm"
                                        title="Editar Ficha"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit_square</span>
                                    </button>
                                    <button 
                                        onClick={() => { if(window.confirm('Confirmar exclusão definitiva deste insumo?')) deleteMaterial(material.id) }}
                                        className="size-9 flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-500 border-2 border-transparent hover:border-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Remover do Inventário"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

       {/* BRUTALIST MODAL (Technical Blueprint Style) */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in-up" onClick={closeModal}>
          <div className="bg-white dark:bg-[#050505] border-4 border-white w-full max-w-lg shadow-[0_0_0_1000px_rgba(0,0,0,0.5)] relative flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-primary p-4 flex justify-between items-center border-b-4 border-black dark:border-white">
                 <h2 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined">dataset</span>
                    {editingMaterial ? 'Editar Especificação' : 'Nova Especificação'}
                </h2>
                <button onClick={closeModal} className="text-white hover:text-black transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_75%,#f3f4f6_75%,#f3f4f6),linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_75%,#f3f4f6_75%,#f3f4f6)] dark:bg-[linear-gradient(45deg,#111_25%,transparent_25%,transparent_75%,#111_75%,#111),linear-gradient(45deg,#111_25%,transparent_25%,transparent_75%,#111_75%,#111)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]">
                <div className="bg-white dark:bg-[#111] border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
                    <label className="flex flex-col text-black dark:text-white font-bold uppercase mb-4">
                        <span className="text-[10px] text-gray-500 mb-1 tracking-widest">Descrição do Insumo</span>
                        <input required className="p-3 bg-transparent text-black dark:text-white border-b-4 border-black dark:border-white focus:border-primary focus:outline-none text-xl font-black uppercase placeholder:text-gray-300 dark:placeholder:text-gray-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="EX: CHAPA MDF" />
                    </label>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <label className="flex flex-col text-black dark:text-white font-bold uppercase">
                            <span className="text-[10px] text-gray-500 mb-1 tracking-widest">Unidade</span>
                            <input required className="p-2 bg-gray-100 dark:bg-black text-black dark:text-white border-2 border-black dark:border-white focus:border-primary focus:outline-none font-mono font-bold" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="UN" />
                        </label>
                        <label className="flex flex-col text-black dark:text-white font-bold uppercase">
                            <span className="text-[10px] text-gray-500 mb-1 tracking-widest">Custo (R$)</span>
                            <input type="number" step="0.01" required className="p-2 bg-gray-100 dark:bg-black text-black dark:text-white border-2 border-black dark:border-white focus:border-primary focus:outline-none font-mono font-bold" value={formData.costPerUnit} onChange={e => setFormData({...formData, costPerUnit: parseFloat(e.target.value)})} />
                        </label>
                    </div>

                    <div className="my-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

                    <div className="grid grid-cols-2 gap-6">
                        <label className="flex flex-col text-black dark:text-white font-bold uppercase">
                            <span className="text-[10px] text-gray-500 mb-1 tracking-widest">Estoque Atual</span>
                            <input type="number" required className="p-2 bg-gray-100 dark:bg-black text-black dark:text-white border-2 border-black dark:border-white focus:border-primary focus:outline-none font-mono font-bold text-lg" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                        </label>
                        <label className="flex flex-col text-black dark:text-white font-bold uppercase">
                            <span className="text-[10px] text-red-500 mb-1 tracking-widest">Ponto de Alerta</span>
                            <input type="number" required className="p-2 bg-red-50 dark:bg-red-900/10 text-red-600 border-2 border-red-200 dark:border-red-900 focus:border-red-500 focus:outline-none font-mono font-bold text-lg" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})} />
                        </label>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-4 bg-white dark:bg-black text-black dark:text-white font-black uppercase border-4 border-transparent hover:border-black dark:hover:border-white transition-all brutal-btn text-xs tracking-widest">Cancelar</button>
                    <button type="submit" className="flex-1 py-4 bg-primary text-white font-black uppercase border-4 border-black dark:border-white hover:brightness-110 transition-all brutal-btn shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] active:translate-y-[2px] active:shadow-none text-xs tracking-widest">Confirmar</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
