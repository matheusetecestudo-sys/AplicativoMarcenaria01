import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const Products: React.FC = () => {
    const { products, updateProductStock, addProduct, updateProduct, deleteProduct, materials } = useApp();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const criticalItemsCount = products.filter(p => p.stock <= (p.minStock || 5)).length;
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.materials || []).some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Refs for File Upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState<any>({
        name: '',
        sku: '',
        materials: [],
        cost: '',
        laborCost: '',
        stock: '',
        minStock: '5',
        image: ''
    });

    // Temp Material Entry
    const [selectedMaterialName, setSelectedMaterialName] = useState('');
    const [materialQty, setMaterialQty] = useState('');
    const [imageUrlInput, setImageUrlInput] = useState('');

    // Sync form with editingProduct
    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                sku: editingProduct.sku || '',
                cost: editingProduct.cost.toString(),
                laborCost: (editingProduct.laborCost || '').toString(),
                stock: editingProduct.stock.toString(),
                minStock: (editingProduct.minStock || 5).toString(),
                materials: editingProduct.materials || [],
                image: editingProduct.image || ''
            });
            setImageUrlInput(editingProduct.image || '');
            setIsModalOpen(true);
        } else {
            resetForm();
        }
    }, [editingProduct]);

    const resetForm = () => {
        setFormData({
            name: '', sku: '', cost: '', laborCost: '', stock: '', minStock: '5', image: '', materials: []
        });
        setImageUrlInput('');
        setSelectedMaterialName('');
        setMaterialQty('');
        setEditingProduct(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setFormData((prev: any) => ({ ...prev, image: result }));
                setImageUrlInput('');
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrlInput(url);
        setFormData((prev: any) => ({ ...prev, image: url }));
    };

    const handleAddMaterial = () => {
        if (!selectedMaterialName.trim()) return;
        const entry = `${selectedMaterialName.trim()}: ${materialQty.trim() || '1'}`;
        const updated = [...(formData.materials || []), entry];
        setFormData({ ...formData, materials: updated });
        setSelectedMaterialName('');
        setMaterialQty('');
    };

    const handleRemoveMaterial = (index: number) => {
        const updated = [...(formData.materials || [])];
        updated.splice(index, 1);
        setFormData({ ...formData, materials: updated });
    };

    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const imgUrl = formData.image?.trim() || `https://placehold.co/400x400/1a1a1a/FFF?text=${formData.name?.substring(0, 3).toUpperCase()}`;
            const cleanData: Product = {
                ...formData,
                cost: parseFloat(formData.cost) || 0,
                laborCost: parseFloat(formData.laborCost) || 0,
                stock: parseInt(formData.stock) || 0,
                minStock: parseInt(formData.minStock) || 5,
                materials: formData.materials || [],
                image: imgUrl
            };

            if (editingProduct) {
                await updateProduct({ ...editingProduct, ...cleanData });
            } else {
                await addProduct({ id: generateUUID(), ...cleanData });
            }
            resetForm();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="flex flex-col gap-6 pb-8 animate-fade-in-up">

            {/* HEADER & SEARCH */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b-4 border-primary pb-4">
                    <div className="flex flex-col items-start">
                        <h1 className="text-4xl md:text-5xl font-black uppercase text-black dark:text-white leading-none">Produtos</h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-2">Catálogo & Produção</p>
                    </div>
                    <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_#0000FF]">
                        Total: {filteredProducts.length} ITENS
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="BUSCAR NOME OU ID..."
                        className="w-full bg-white dark:bg-black border-4 border-black dark:border-white p-4 pl-12 text-sm md:text-base font-black uppercase focus:border-primary outline-none transition-all brutal-input placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Add Button */}
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] border-4 border-black dark:border-white hover:brightness-110 active:scale-95 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">add_box</span>
                    NOVO PRODUTO
                </button>
            </div>

            {/* CRITICAL ALERTS */}
            {criticalItemsCount > 0 && (
                <div className="p-4 bg-red-600 text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] flex items-center gap-4 animate-fade-in">
                    <span className="material-symbols-outlined text-4xl animate-pulse">emergency_home</span>
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">ALERTA DE SEGURANÇA</p>
                        <p className="text-xl font-black uppercase">{criticalItemsCount} Produtos com estoque crítico</p>
                    </div>
                </div>
            )}

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-20 bg-white dark:bg-[#1A1A1A] border-4 border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center opacity-30">
                        <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                        <span className="text-xl font-black uppercase text-black dark:text-white">Nenhum resultado</span>
                    </div>
                ) : filteredProducts.map((product) => {
                    const isCritical = product.stock <= (product.minStock || 5);
                    return (
                        <div
                            key={product.id}
                            className={`relative border-4 flex flex-col bg-white dark:bg-[#1A1A1A] overflow-hidden transition-all duration-300 group ${isCritical ? 'border-red-500 shadow-[8px_8px_0px_0px_#FF0000]' : 'border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]'} hover:shadow-[12px_12px_0px_0px_#0000FF] hover:scale-[1.02]`}
                        >
                            {/* Header */}
                            <div className={`flex justify-between items-center p-3 border-b-4 ${isCritical ? 'bg-red-500 text-white border-red-500' : 'bg-gray-100 dark:bg-[#1A1A1A] text-black dark:text-white border-black dark:border-white'}`}>
                                <div className="flex flex-col">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isCritical ? 'text-white/60' : 'text-gray-400'}`}>SKU: {product.sku || '---'}</span>
                                    <h3 className="text-sm font-black uppercase truncate max-w-[180px]">{product.name}</h3>
                                </div>
                                <div className={`px-2 py-1 text-[8px] font-black uppercase border-2 ${isCritical ? 'border-white bg-white text-red-500' : 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'}`}>
                                    {isCritical ? 'ESTOQUE BAIXO' : 'ESTOQUE OK'}
                                </div>
                            </div>

                            {/* Image */}
                            <div className="aspect-square bg-white relative overflow-hidden border-b-4 border-black dark:border-white">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover p-0 group-hover:scale-105 transition-all duration-500"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/F5F5F5/333?text=${product.name.substring(0, 3).toUpperCase()}`; }}
                                />
                            </div>

                            {/* Info Bar */}
                            <div className="bg-gray-50 dark:bg-black p-4 border-b-4 border-black dark:border-white flex justify-between items-center transition-colors group-hover:bg-white dark:group-hover:bg-[#111]">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-base">sell</span>
                                    <span className="text-2xl font-black text-primary font-mono tracking-tighter">R$ {product.cost.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-400 text-base">inventory</span>
                                    <span className="text-base font-black text-black dark:text-white font-mono">{product.stock} UN</span>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="grid grid-cols-2 h-20 bg-white dark:bg-[#1A1A1A]">
                                <div className="flex items-center justify-between px-4 border-r-4 border-black dark:border-white">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateProductStock(product.id, -1) }}
                                        className="size-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-primary hover:scale-105 transition-all text-2xl font-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-px active:shadow-none"
                                    >
                                        -
                                    </button>
                                    <span className="font-mono font-black text-xl text-black dark:text-white">{product.stock}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateProductStock(product.id, 1) }}
                                        className="size-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-primary hover:scale-105 transition-all text-2xl font-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-px active:shadow-none"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="grid grid-cols-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                                        className="bg-white dark:bg-black text-black dark:text-white border-r-4 border-black dark:border-white flex items-center justify-center hover:bg-primary hover:text-white transition-all group/edit"
                                        title="Editar Produto"
                                    >
                                        <span className="material-symbols-outlined text-3xl group-hover/edit:rotate-12 transition-transform">edit_note</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }}
                                        className="bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all group/del"
                                        title="Remover"
                                    >
                                        <span className="material-symbols-outlined text-3xl group-hover/del:scale-110 transition-transform">delete_forever</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in-up p-0 sm:p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-[#0A0A0A] w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:max-h-[90vh] border-0 sm:border-4 border-primary shadow-none sm:shadow-[12px_12px_0px_0px_rgba(0,0,255,0.3)] flex flex-col" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="bg-primary p-4 flex justify-between items-center border-b-4 border-black dark:border-white shrink-0">
                            <h2 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined">design_services</span>
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-black transition-colors">
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <form id="product-form" onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col gap-6">

                                {/* Image */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-primary tracking-widest">Imagem do Produto</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative w-full aspect-video sm:aspect-square border-4 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/40 flex items-center justify-center cursor-pointer group hover:border-primary transition-all overflow-hidden"
                                    >
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all">
                                                <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                                <span className="text-[10px] font-black uppercase">Upload da Imagem</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                    <input
                                        type="text"
                                        placeholder="OU URL DA IMAGEM..."
                                        className="w-full bg-gray-100 dark:bg-black p-3 text-[10px] border-2 border-gray-300 dark:border-gray-800 focus:border-primary focus:outline-none font-bold uppercase"
                                        value={imageUrlInput}
                                        onChange={handleImageUrlChange}
                                    />
                                </div>

                                {/* Basic Info */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">SKU / Código</label>
                                        <input
                                            className="w-full bg-gray-50 dark:bg-black border-2 border-black/10 dark:border-white/10 p-3 text-sm font-mono font-bold text-black dark:text-white focus:border-primary outline-none transition-all uppercase"
                                            placeholder="PROD-001"
                                            value={formData.sku}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome do Produto</label>
                                        <input
                                            className="w-full bg-white dark:bg-black border-2 border-black dark:border-white p-4 text-base font-black text-black dark:text-white placeholder:text-gray-400 focus:border-primary outline-none transition-all uppercase"
                                            placeholder="NOME DO ITEM..."
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Financial / Inventory */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5 h-full">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                                            Custo Prod.
                                            <span className="material-symbols-outlined text-[10px] cursor-help" title="Custo total de materiais + mão de obra">info</span>
                                        </label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 p-3 text-sm font-mono font-bold focus:border-primary outline-none"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                                            Mão de Obra
                                            <span className="material-symbols-outlined text-[10px]" title="Custo fixo de tempo/trabalho">engineering</span>
                                        </label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 p-3 text-sm font-mono font-bold focus:border-primary outline-none"
                                            value={formData.laborCost}
                                            onChange={e => setFormData({ ...formData, laborCost: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Estoque</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 p-3 text-sm font-mono font-bold focus:border-primary outline-none"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Min Stock */}
                                <div className="p-4 bg-red-500/5 border-l-4 border-red-500 flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-red-500 tracking-widest">Alerta de Estoque Mínimo</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white dark:bg-black border-2 border-red-100 dark:border-red-900/30 p-3 text-sm font-mono font-bold focus:border-red-500 outline-none text-red-600"
                                        value={formData.minStock}
                                        onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                                    />
                                </div>

                                {/* Materials */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xs">inventory</span>
                                        Insumos Utilizados
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 p-3 text-xs font-bold uppercase outline-none focus:border-primary"
                                            value={selectedMaterialName}
                                            onChange={e => setSelectedMaterialName(e.target.value)}
                                        >
                                            <option value="">Selecionar...</option>
                                            {materials.map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            className="w-20 bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 p-3 text-xs font-bold font-mono outline-none focus:border-primary"
                                            placeholder="QTD"
                                            value={materialQty}
                                            onChange={e => setMaterialQty(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddMaterial}
                                            className="size-12 bg-primary text-white flex items-center justify-center border-2 border-black hover:brightness-110 active:scale-95 transition-all"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>

                                    <div className="min-h-[120px] border-4 border-dashed border-gray-200 dark:border-gray-800 p-2 flex flex-col gap-2 bg-gray-50/30 dark:bg-black/10">
                                        {formData.materials.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-30 p-4">
                                                <span className="material-symbols-outlined text-4xl mb-1">playlist_add</span>
                                                <p className="text-[8px] font-black uppercase text-center">Nenhum insumo adicionado</p>
                                            </div>
                                        ) : (
                                            formData.materials.map((matStr: string, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center bg-white dark:bg-black p-2 border-2 border-black/10 dark:border-white/10 shadow-sm group hover:border-primary transition-all">
                                                    <span className="text-[10px] font-black uppercase truncate max-w-[80%] flex items-center gap-2">
                                                        <div className="size-1 bg-primary"></div>
                                                        {matStr}
                                                    </span>
                                                    <button type="button" onClick={() => handleRemoveMaterial(idx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 md:p-6 bg-white dark:bg-[#0D0D0D] border-t-4 border-black dark:border-white flex gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 border-2 border-gray-300 dark:border-gray-700 text-gray-500 hover:text-black dark:hover:text-white font-black uppercase text-[10px] tracking-widest transition-all"
                            >
                                CANCELAR
                            </button>
                            <button
                                form="product-form"
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 h-14 bg-primary text-white font-black uppercase tracking-[0.2em] border-2 border-transparent hover:brightness-110 active:scale-95 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]"
                            >
                                {isSaving ? 'SALVANDO...' : editingProduct ? 'ATUALIZAR' : 'CADASTRAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};