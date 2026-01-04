
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Material } from '../types';

export const Materials: React.FC = () => {
    const { materials, addMaterial, updateMaterial, deleteMaterial, updateMaterialStock, settings } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'TODOS' | 'BAIXO' | 'CRITICO'>('TODOS');

    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [editingNameId, setEditingNameId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<string>('');
    const [tempName, setTempName] = useState<string>('');

    const handleQuickStock = async (id: string, delta: number) => {
        setUpdatingId(id);
        await updateMaterialStock(id, delta);
        setTimeout(() => setUpdatingId(null), 500);
    };

    const handleQuickPrice = async (material: Material, newPrice: string) => {
        const price = parseFloat(newPrice);
        if (isNaN(price)) {
            setEditingPriceId(null);
            return;
        }
        setUpdatingId(material.id);
        await updateMaterial({ ...material, costPerUnit: price });
        setEditingPriceId(null);
        setTimeout(() => setUpdatingId(null), 500);
    };

    const handleQuickName = async (material: Material, newName: string) => {
        if (!newName.trim() || newName.trim() === material.name) {
            setEditingNameId(null);
            return;
        }
        setUpdatingId(material.id);
        await updateMaterial({ ...material, name: newName.trim() });
        setEditingNameId(null);
        setTimeout(() => setUpdatingId(null), 500);
    };

    const [formData, setFormData] = useState<Partial<Material>>({
        name: '', unit: 'un', costPerUnit: 0, stock: 0, minStock: 0, isExcluded: false
    });

    // --- STATS CALCULATION ---
    const activeMaterials = materials.filter(m => !m.isExcluded);
    const totalItems = activeMaterials.length;
    const totalValue = activeMaterials.reduce((acc, m) => acc + (m.stock * m.costPerUnit), 0);
    const criticalItems = activeMaterials.filter(m => m.stock <= m.minStock).length;

    const openModal = (material?: Material) => {
        if (material) {
            setEditingMaterial(material);
            setFormData({
                ...material
            });
        } else {
            setEditingMaterial(null);
            setFormData({ name: '', unit: 'un', costPerUnit: 0, stock: 0, minStock: 5, isExcluded: false });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMaterial(null);
    };

    // UUID Generator
    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMaterial) {
            updateMaterial({ ...editingMaterial, ...formData as Material });
        } else {
            addMaterial({
                id: generateUUID(),
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
                    <div className="bg-white dark:bg-[#1A1A1A] border-l-4 border-primary p-4 shadow-sm flex flex-col justify-between">
                        <p className="text-[10px] font-black uppercase text-gray-400">Capital Imobilizado (Total)</p>
                        <p className="text-2xl font-black text-black dark:text-white truncate font-mono tracking-tighter">
                            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] border-l-4 border-black dark:border-white p-4 shadow-sm flex flex-col justify-between">
                        <p className="text-[10px] font-black uppercase text-gray-400">Total de Itens Ativos</p>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-black text-black dark:text-white font-mono">{totalItems}</p>
                            <span className="text-[10px] font-bold uppercase text-gray-500">Unidades Distintas</span>
                        </div>
                    </div>
                    <div className={`bg-white dark:bg-[#1A1A1A] border-l-4 p-4 shadow-sm flex flex-col justify-between ${criticalItems > 0 ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-green-500'}`}>
                        <div className="flex justify-between items-center">
                            <p className={`text-[10px] font-black uppercase ${criticalItems > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                Itens Críticos
                            </p>
                            {criticalItems > 0 && <span className="material-symbols-outlined text-red-500 animate-pulse text-xl">warning</span>}
                        </div>
                        <p className={`text-2xl font-black font-mono ${criticalItems > 0 ? 'text-red-600' : 'text-black dark:text-white'}`}>
                            {criticalItems} <span className="text-[10px] text-black dark:text-white">Abaixo do Mínimo</span>
                        </p>
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

                <div className="flex flex-col gap-4 w-full xl:w-auto mt-4 xl:mt-0">
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center h-14 w-full xl:w-auto px-6 bg-primary text-white text-sm font-black uppercase border-4 border-black dark:border-white hover:brightness-110 transition-all brutal-btn shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] active:translate-y-[2px] active:shadow-none whitespace-nowrap gap-2 order-first xl:order-last"
                    >
                        <span className="material-symbols-outlined text-xl">add_box</span>
                        <span>Novo Insumo</span>
                    </button>

                    <div className="relative flex-1 xl:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="BUSCAR INSUMO..."
                            className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-black border-4 border-gray-300 dark:border-gray-700 text-black dark:text-white font-bold uppercase focus:border-primary focus:outline-none transition-colors brutal-input text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 3. RESPONSIVE VIEW: TABLE (DESKTOP) / LIST (MOBILE) */}
            <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-[#0A0A0A] shadow-lg overflow-hidden">

                {/* TABLE FOR DESKTOP */}
                <table className="hidden lg:table w-full text-left border-collapse">
                    <thead className="bg-black dark:bg-white text-white dark:text-black">
                        <tr>
                            <th className="p-4 text-[11px] font-black uppercase w-[30%] tracking-widest border-r border-gray-700 dark:border-gray-300">Especificação Técnica</th>
                            <th className="p-4 text-[11px] font-black uppercase w-[15%] tracking-widest border-r border-gray-700 dark:border-gray-300 text-right">Custo / UN</th>
                            <th className="p-4 text-[11px] font-black uppercase w-[30%] tracking-widest border-r border-gray-700 dark:border-gray-300">Nível de Estoque</th>
                            <th className="p-4 text-[11px] font-black uppercase w-[15%] text-center tracking-widest border-r border-gray-700 dark:border-gray-300">Estado</th>
                            <th className="p-4 text-[11px] font-black uppercase w-[10%] text-center tracking-widest">Controle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100 dark:divide-gray-900">
                        {filteredMaterials.map((material) => {
                            const percentage = Math.min((material.stock / (material.minStock * 2)) * 100, 100);
                            const isLow = material.stock <= material.minStock;
                            const isCritical = material.stock <= material.minStock / 2;
                            const isUpdating = updatingId === material.id;
                            const isExcluded = material.isExcluded;

                            return (
                                <tr
                                    key={material.id}
                                    onDoubleClick={() => openModal(material)}
                                    title="Clique duplo para editar"
                                    className={`
                                    hover:bg-blue-50 dark:hover:bg-white/5 transition-colors group bg-white dark:bg-[#111] cursor-pointer
                                    ${isUpdating ? 'bg-blue-100/50 dark:bg-blue-900/20' : ''}
                                    ${isExcluded ? 'opacity-40 grayscale' : ''}
                                `}>
                                    <td className="p-5 border-r border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-col gap-1">
                                            {editingNameId === material.id ? (
                                                <input
                                                    autoFocus
                                                    className="w-full bg-white dark:bg-black border-2 border-primary text-black dark:text-white px-2 font-black uppercase focus:outline-none"
                                                    value={tempName}
                                                    onChange={e => setTempName(e.target.value)}
                                                    onBlur={() => handleQuickName(material, tempName)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleQuickName(material, tempName);
                                                        if (e.key === 'Escape') setEditingNameId(null);
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 group/name">
                                                    <span
                                                        className="text-base font-black text-black dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors cursor-text"
                                                        onClick={(e) => { e.stopPropagation(); setEditingNameId(material.id); setTempName(material.name); }}
                                                    >
                                                        {material.name}
                                                    </span>
                                                    {isExcluded && <span className="bg-gray-500 text-white text-[8px] px-1 font-bold">EXCLUÍDO</span>}
                                                    <span className="material-symbols-outlined text-[12px] text-gray-400 opacity-0 group-hover/name:opacity-100 transition-opacity">edit</span>
                                                </div>
                                            )}
                                            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">ID: {material.id.substring(0, 8).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right border-r border-gray-100 dark:border-gray-800 font-mono font-bold text-black dark:text-white">
                                        {editingPriceId === material.id ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-[10px] text-primary">R$</span>
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    step="0.01"
                                                    className="w-24 bg-white dark:bg-black border-2 border-primary text-right px-1 focus:outline-none"
                                                    value={tempPrice}
                                                    onChange={e => setTempPrice(e.target.value)}
                                                    onBlur={() => handleQuickPrice(material, tempPrice)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleQuickPrice(material, tempPrice);
                                                        if (e.key === 'Escape') setEditingPriceId(null);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="hover:text-primary transition-colors flex items-center justify-end gap-1 group/price"
                                                onClick={(e) => { e.stopPropagation(); setEditingPriceId(material.id); setTempPrice(material.costPerUnit.toString()); }}
                                            >
                                                <span>R$ {material.costPerUnit.toFixed(2)}</span>
                                                <span className="material-symbols-outlined text-[10px] opacity-0 group-hover/price:opacity-100 transition-opacity">edit</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 border-r border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleQuickStock(material.id, -1)}
                                                        className="size-6 bg-gray-100 dark:bg-black border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition-all active:scale-90"
                                                    >-</button>
                                                    <span className={`text-sm font-black text-black dark:text-white transition-all ${isUpdating ? 'scale-125 text-primary' : ''}`}>
                                                        {material.stock} {material.unit}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuickStock(material.id, 1)}
                                                        className="size-6 bg-gray-100 dark:bg-black border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition-all active:scale-90"
                                                    >+</button>
                                                </div>
                                                <span>Alerta: {material.minStock}</span>
                                            </div>
                                            <div className="w-full h-3 bg-gray-100 dark:bg-[#222] border border-black dark:border-white overflow-hidden relative">
                                                <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]' : isLow ? 'bg-yellow-400 shadow-[0_0_10px_rgba(255,255,0,0.3)]' : 'bg-green-500'}`} style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center border-r border-gray-100 dark:border-gray-800">
                                        <span className={`px-2 py-1 text-[10px] font-black uppercase border-2 shadow-[2px_2px_0px_#000]
                                            ${isCritical ? 'bg-red-500 text-white border-red-700 pulse-red' : isLow ? 'bg-yellow-400 text-black border-yellow-600' : 'bg-green-500 text-white border-green-700'}`}>
                                            {isCritical ? 'CRÍTICO' : isLow ? 'BAIXO' : 'NORMAL'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openModal(material)}
                                                className="size-11 flex items-center justify-center bg-primary text-white border-2 border-black dark:border-white hover:scale-110 active:scale-95 transition-all shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"
                                                title="Editar Técnica"
                                            >
                                                <span className="material-symbols-outlined text-xl">tune</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const btn = document.getElementById(`del-btn-${material.id}`);
                                                    if (btn?.classList.contains('confirm-mode')) {
                                                        deleteMaterial(material.id);
                                                    } else {
                                                        btn?.classList.add('confirm-mode');
                                                        if (btn) btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span>';
                                                        setTimeout(() => {
                                                            if (btn) {
                                                                btn.classList.remove('confirm-mode');
                                                                btn.innerHTML = '<span class="material-symbols-outlined text-sm">delete</span>';
                                                            }
                                                        }, 3000);
                                                    }
                                                }}
                                                id={`del-btn-${material.id}`}
                                                className="size-11 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_#FF0000] [&.confirm-mode]:bg-red-700 [&.confirm-mode]:text-white [&.confirm-mode]:animate-pulse"
                                                title="Excluir"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* LIST FOR MOBILE */}
                <div className="lg:hidden flex flex-col divide-y-4 divide-black dark:divide-white">
                    {filteredMaterials.map((material) => {
                        const isLow = material.stock <= material.minStock;
                        const isCritical = material.stock <= material.minStock / 2;
                        const isUpdating = updatingId === material.id;
                        const isExcluded = material.isExcluded;

                        return (
                            <div
                                key={material.id}
                                onDoubleClick={() => openModal(material)}
                                className={`p-4 bg-white dark:bg-[#111] flex flex-col gap-4 transform transition-all cursor-pointer ${isUpdating ? 'scale-[1.02] border-l-8 border-primary' : ''} ${isExcluded ? 'opacity-50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">#{material.id.substring(0, 8)}</p>
                                        {editingNameId === material.id ? (
                                            <input
                                                autoFocus
                                                className="w-full bg-white dark:bg-black border-2 border-primary text-lg font-black text-black dark:text-white uppercase focus:outline-none"
                                                value={tempName}
                                                onChange={e => setTempName(e.target.value)}
                                                onBlur={() => handleQuickName(material, tempName)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleQuickName(material, tempName);
                                                    if (e.key === 'Escape') setEditingNameId(null);
                                                }}
                                            />
                                        ) : (
                                            <h3
                                                className="text-lg font-black text-black dark:text-white uppercase leading-tight flex items-center gap-2 group/mname"
                                                onClick={(e) => { e.stopPropagation(); setEditingNameId(material.id); setTempName(material.name); }}
                                            >
                                                {material.name}
                                                <span className="material-symbols-outlined text-sm opacity-0 group-hover/mname:opacity-100">edit</span>
                                            </h3>
                                        )}
                                    </div>
                                    <div
                                        className="flex flex-col items-end gap-1"
                                        onClick={(e) => { e.stopPropagation(); setEditingPriceId(material.id); setTempPrice(material.costPerUnit.toString()); }}
                                    >
                                        <span className={`px-2 py-1 text-[9px] font-black uppercase border-2 shadow-[2px_2px_0px_#000]
                                                ${isCritical ? 'bg-red-500 text-white border-red-700' : isLow ? 'bg-yellow-400 text-black border-yellow-600' : 'bg-green-500 text-white border-green-700'}`}>
                                            {isCritical ? 'CRÍTICO' : isLow ? 'BAIXO' : 'NORMAL'}
                                        </span>
                                        {editingPriceId === material.id ? (
                                            <input
                                                autoFocus
                                                type="number"
                                                step="0.01"
                                                className="w-20 bg-white dark:bg-black border-2 border-primary text-right px-1 text-[9px] font-mono font-bold text-black dark:text-white"
                                                value={tempPrice}
                                                onChange={e => setTempPrice(e.target.value)}
                                                onBlur={() => handleQuickPrice(material, tempPrice)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleQuickPrice(material, tempPrice);
                                                    if (e.key === 'Escape') setEditingPriceId(null);
                                                }}
                                            />
                                        ) : (
                                            <span className="text-[9px] font-mono font-bold text-gray-500 flex items-center gap-1 group/mprice">
                                                R$ {material.costPerUnit.toFixed(2)} / {material.unit}
                                                <span className="material-symbols-outlined text-[8px] opacity-0 group-hover/mprice:opacity-100">edit</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 bg-gray-50 dark:bg-white/5 p-4 border-2 border-black">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Controle de Estoque</span>
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Min: {material.minStock}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => handleQuickStock(material.id, -1)}
                                            className="size-12 bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] flex items-center justify-center active:translate-y-1 active:shadow-none"
                                        ><span className="material-symbols-outlined">remove</span></button>

                                        <div className="flex flex-col items-center">
                                            <span className={`text-3xl font-black text-black dark:text-white transition-all ${isUpdating ? 'scale-150 text-primary' : ''}`}>
                                                {material.stock}
                                            </span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase">{material.unit}</span>
                                        </div>

                                        <button
                                            onClick={() => handleQuickStock(material.id, 1)}
                                            className="size-12 bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] flex items-center justify-center active:translate-y-1 active:shadow-none"
                                        ><span className="material-symbols-outlined">add</span></button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => openModal(material)}
                                        className="flex-1 h-14 flex items-center justify-center bg-primary text-white font-black uppercase text-sm border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none gap-2"
                                    >
                                        <span className="material-symbols-outlined">tune</span>
                                        Configurar
                                    </button>
                                    <button
                                        onClick={() => { if (window.confirm('Excluir definitivo?')) deleteMaterial(material.id) }}
                                        className="size-14 flex items-center justify-center bg-red-500 text-white border-2 border-black dark:border-white shadow-[4px_4px_0px_#000]"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BRUTALIST MODAL (Technical Blueprint Style) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-sm animate-fade-in-up" onClick={closeModal}>
                    <div className="bg-white dark:bg-[#050505] border-0 md:border-4 border-primary w-full max-w-lg shadow-none md:shadow-[12px_12px_0px_0px_rgba(0,0,255,0.3)] relative flex flex-col h-full md:h-auto md:max-h-[90vh] md:rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="bg-primary p-4 flex justify-between items-center border-b-4 border-black dark:border-white shrink-0">
                            <h2 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined">dataset</span>
                                {editingMaterial ? 'Editar Insumo' : 'Novo Insumo'}
                            </h2>
                            <button onClick={closeModal} className="text-white hover:text-black transition-colors">
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 bg-white dark:bg-[#0A0A0A]">
                            <div className="bg-gray-50 dark:bg-[#111] border-2 md:border-4 border-black dark:border-white p-4 md:p-6 shadow-none md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                                <label className="flex flex-col text-black dark:text-white font-bold uppercase mb-6">
                                    <span className="text-[10px] text-gray-500 mb-2 tracking-widest">Nome do Insumo / Descrição</span>
                                    <input
                                        required
                                        className="p-3 bg-white dark:bg-black text-black dark:text-white border-b-4 border-primary focus:border-black dark:focus:border-white focus:outline-none text-xl font-black uppercase placeholder:text-gray-300 dark:placeholder:text-gray-700 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="EX: CHAPA MDF BRANCO 18MM"
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-4 md:gap-6">
                                    <label className="flex flex-col text-black dark:text-white font-bold uppercase">
                                        <span className="text-[10px] text-gray-500 mb-2 tracking-widest">Unidade</span>
                                        <input
                                            required
                                            className="p-3 bg-white dark:bg-black text-black dark:text-white border-2 border-gray-200 dark:border-gray-800 focus:border-primary focus:outline-none font-mono font-bold"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            placeholder="UN, M2, LT..."
                                        />
                                    </label>
                                    <label className="flex flex-col text-black dark:text-white font-bold uppercase">
                                        <span className="text-[10px] text-gray-500 mb-2 tracking-widest">Custo Unit. (R$)</span>
                                        <input
                                            type="number" step="0.01"
                                            required
                                            className="p-3 bg-white dark:bg-black text-black dark:text-white border-2 border-gray-200 dark:border-gray-800 focus:border-primary focus:outline-none font-mono font-bold"
                                            value={formData.costPerUnit}
                                            onChange={e => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
                                        />
                                    </label>
                                </div>

                                <div className="my-6 border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>

                                <div className="grid grid-cols-2 gap-4 md:gap-6">
                                    <label className="flex flex-col text-black dark:text-white font-bold uppercase">
                                        <span className="text-[10px] text-gray-500 mb-2 tracking-widest">Qtd em Estoque</span>
                                        <input
                                            type="number"
                                            required
                                            className="p-3 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white focus:border-primary focus:outline-none font-mono font-bold text-lg"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        />
                                    </label>
                                    <label className="flex flex-col text-black dark:text-white font-bold uppercase">
                                        <span className="text-[10px] text-red-500 mb-2 tracking-widest">Alerta de Baixa</span>
                                        <input
                                            type="number"
                                            required
                                            className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 border-2 border-red-500 focus:border-black focus:outline-none font-mono font-bold text-lg"
                                            value={formData.minStock}
                                            onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                                        />
                                    </label>
                                </div>

                                <div className="mt-6 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isExcluded"
                                        checked={formData.isExcluded}
                                        onChange={e => setFormData({ ...formData, isExcluded: e.target.checked })}
                                        className="size-5 accent-primary"
                                    />
                                    <label htmlFor="isExcluded" className="text-xs font-black uppercase text-gray-500 cursor-pointer">
                                        Excluir das estatísticas globais
                                    </label>
                                </div>
                            </div>
                            <div className="mt-auto pt-6 flex flex-col md:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-4 text-black dark:text-white font-black uppercase hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-sm tracking-widest"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-primary text-white font-black uppercase shadow-[4px_4px_0px_0px_black] active:translate-y-[2px] active:shadow-none transition-all text-sm tracking-widest border-2 border-black"
                                >
                                    Salvar Insumo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
