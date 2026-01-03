import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const Products: React.FC = () => {
    const { products, updateProductStock, addProduct, updateProduct, deleteProduct, materials: rawMaterials } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const criticalItems = products.filter(p => p.stock <= (p.minStock || 5)).length;

    // Refs for File Upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State - Using 'any' for cost/stock to allow intermediate string states (like "10.") during typing
    const [formData, setFormData] = useState<any>({
        name: '',
        sku: '',
        materials: [],
        cost: 0,
        stock: 0,
        minStock: 0,
        image: ''
    });

    // New "Blueprint" State
    const [tempMaterialName, setTempMaterialName] = useState('');
    const [tempMaterialQty, setTempMaterialQty] = useState('');
    const [imageUrlInput, setImageUrlInput] = useState('');

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product }); // Clone to avoid reference issues
            setImageUrlInput(product.image || '');
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', sku: '', cost: '', stock: '', minStock: '', image: '', materials: []
            });
            setImageUrlInput('');
        }
        setTempMaterialName('');
        setTempMaterialQty('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setFormData((prev: any) => ({ ...prev, image: result }));
                setImageUrlInput(''); // Clear URL input if file is used
            };
            reader.readAsDataURL(file);
        }
        // Critical: Reset input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrlInput(url);
        setFormData((prev: any) => ({ ...prev, image: url }));
    };

    const addMaterialToBlueprint = () => {
        if (!tempMaterialName.trim()) return;

        const newMaterialEntry = `${tempMaterialName.trim()}: ${tempMaterialQty.trim() || '1'}`;
        const updatedMaterials = [...(formData.materials || []), newMaterialEntry];

        setFormData({ ...formData, materials: updatedMaterials });
        setTempMaterialName('');
        setTempMaterialQty('');
    };

    const removeMaterialFromBlueprint = (index: number) => {
        const updatedMaterials = [...(formData.materials || [])];
        updatedMaterials.splice(index, 1);
        setFormData({ ...formData, materials: updatedMaterials });
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

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Fallback image if none uploaded
            const imgUrl = formData.image?.trim() || `https://placehold.co/400x400/1a1a1a/FFF?text=${formData.name?.substring(0, 3).toUpperCase()}`;

            // Ensure numbers are parsed correctly from string inputs
            const cleanData: Product = {
                ...formData,
                cost: parseFloat(formData.cost) || 0,
                stock: parseInt(formData.stock) || 0,
                minStock: parseInt(formData.minStock) || 0,
                materials: formData.materials || [],
                image: imgUrl
            };

            if (editingProduct) {
                await updateProduct({
                    ...editingProduct,
                    ...cleanData,
                    id: editingProduct.id
                });
            } else {
                await addProduct({
                    id: generateUUID(),
                    ...cleanData
                });
            }
            closeModal();
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative h-full flex flex-col pb-8">
            {/* HEADER */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8 border-b-4 border-primary pb-6 shrink-0">
                <div>
                    <h1 className="text-black dark:text-white text-4xl md:text-6xl font-black tracking-[-0.05em] uppercase leading-none transition-colors">
                        Produtos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-2 text-sm">
                        Catálogo & Produção ({filteredProducts.length})
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="BUSCAR NOME OU ID..."
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black border-4 border-gray-300 dark:border-gray-700 text-black dark:text-white font-bold uppercase focus:border-primary focus:outline-none transition-colors brutal-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center h-12 px-8 bg-black dark:bg-white text-white dark:text-black text-sm font-black uppercase border-4 border-transparent hover:bg-primary hover:text-white hover:border-black dark:hover:border-white transition-all brutal-btn shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-none whitespace-nowrap gap-2"
                    >
                        <span className="material-symbols-outlined">add_photo_alternate</span>
                        <span>Novo Produto</span>
                    </button>
                </div>
            </header>

            {/* ALERTS SECTION (Industrial Style) */}
            {criticalItems > 0 && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 shadow-sm flex justify-between items-center animate-fade-in-up">
                    <div>
                        <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Atenção Necessária</p>
                        <p className="text-xl font-black text-red-600 dark:text-red-400 uppercase">
                            {criticalItems} {criticalItems === 1 ? 'Produto com' : 'Produtos com'} Estoque Baixo
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
                </div>
            )}

            {/* GRID */}
            {filteredProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50 border-4 border-dashed border-gray-300 dark:border-gray-800 p-12">
                    <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
                    <p className="text-xl font-bold uppercase">Nenhum produto encontrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-8">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="group flex flex-col bg-white dark:bg-[#1a1a1a] border-4 border-black dark:border-white hover:border-primary dark:hover:border-primary transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-[8px_8px_0px_0px_rgba(0,0,255,0.2)]">

                            {/* IMAGE SECTION - Big & Clear */}
                            <div className="relative w-full aspect-[3/2] border-b-4 border-black dark:border-white bg-gray-50 dark:bg-black overflow-hidden flex flex-col justify-center">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-2 filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a1a/FFF?text=${product.name.substring(0, 3).toUpperCase()}`; }}
                                />
                                {/* Stock Badge */}
                                <div className="absolute top-3 left-3">
                                    <div className={`px-3 py-1 border-2 shadow-md ${product.stock <= (product.minStock || 5) ? 'bg-red-600 border-white text-white animate-pulse' : 'bg-white border-black text-black'}`}>
                                        <span className="text-[10px] font-black uppercase tracking-wider">
                                            {product.stock <= (product.minStock || 5) ? 'Estoque Baixo' : 'Disponível'}
                                        </span>
                                    </div>
                                </div>
                                {/* ID Badge */}
                                <div className="absolute top-3 right-3">
                                    <div className="bg-black/80 dark:bg-white/80 backdrop-blur-sm px-2 py-0.5 border border-white/20 dark:border-black/20">
                                        <span className="text-[9px] font-mono font-bold text-white dark:text-black">
                                            #{product.sku || 'S/ID'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CONTENT SECTION */}
                            <div className="p-5 flex flex-col flex-1 gap-4">

                                {/* Header Info */}
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black uppercase leading-none text-black dark:text-white mb-2 line-clamp-2">
                                        {product.name}
                                    </h2>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Custo UN</span>
                                        <span className="text-xl font-mono font-black text-primary">R$ {product.cost.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Materials Summary */}
                                <div className="flex-1 p-3 bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-gray-800 rounded-sm">
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">format_list_bulleted</span>
                                        Insumos ({product.materials.length})
                                    </p>
                                    <div className="text-xs font-mono text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                        {product.materials.length > 0 ? (
                                            <ul className="list-disc list-inside">
                                                {product.materials.slice(0, 3).map((m, i) => {
                                                    const [name, qty] = m.split(':');
                                                    return (
                                                        <li key={i} className="truncate text-[10px] md:text-xs">
                                                            <span className="font-bold text-black dark:text-gray-200">{name}</span>
                                                            {qty && <span className="text-gray-400 ml-1">({qty}un)</span>}
                                                        </li>
                                                    );
                                                })}
                                                {product.materials.length > 3 && <li className="italic text-[10px] opacity-70 mt-1">...mais {product.materials.length - 3} itens</li>}
                                            </ul>
                                        ) : (
                                            <span className="italic opacity-50">Nenhum material cadastrado.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Controls Footer */}
                                <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700 mt-2">

                                    {/* Stock Adjust */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-bold uppercase text-gray-400">Estoque</label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateProductStock(product.id, -1) }}
                                                className="size-8 flex items-center justify-center bg-gray-100 dark:bg-[#222] hover:bg-red-500 hover:text-white transition-colors border border-gray-300 dark:border-gray-600 rounded-sm"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <span className="w-8 text-center font-mono font-bold text-lg text-black dark:text-white">{product.stock}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateProductStock(product.id, 1) }}
                                                className="size-8 flex items-center justify-center bg-gray-100 dark:bg-[#222] hover:bg-green-500 hover:text-white transition-colors border border-gray-300 dark:border-gray-600 rounded-sm"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 self-end">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openModal(product); }}
                                            className="h-10 px-3 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:bg-primary hover:text-white font-bold uppercase text-xs tracking-wider transition-all brutal-btn"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (window.confirm('Excluir?')) deleteProduct(product.id) }}
                                            className="size-10 flex items-center justify-center border-2 border-transparent hover:border-red-500 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MINIMALIST BRUTALIST MODAL */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-sm animate-fade-in-up" onClick={closeModal}>
                        <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-4xl border-0 md:border-4 border-primary shadow-none md:shadow-[12px_12px_0px_0px_rgba(0,0,255,0.5)] flex flex-col h-full md:max-h-[90vh] md:rounded-lg" onClick={e => e.stopPropagation()}>

                            {/* Modal Header */}
                            <div className="bg-primary p-4 flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined">design_services</span>
                                    {editingProduct ? 'Editar Projeto' : 'Novo Projeto'}
                                </h2>
                                <button onClick={closeModal} className="text-white hover:text-black transition-colors">
                                    <span className="material-symbols-outlined text-3xl">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:grid md:grid-cols-2">

                                {/* LEFT: IMAGE & IDENTITY */}
                                <div className="p-6 md:p-8 flex flex-col gap-8 md:overflow-y-auto border-b-4 md:border-b-0 md:border-r-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] shrink-0">

                                    {/* Image Upload Area */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black uppercase text-primary mb-1">Visualização do Produto</label>

                                        {/* Hotlink Input */}
                                        <input
                                            type="text"
                                            placeholder="URL da Imagem (Opcional)..."
                                            className="w-full bg-gray-100 dark:bg-black p-3 text-xs border-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none font-bold text-black dark:text-white"
                                            value={imageUrlInput}
                                            onChange={handleImageUrlChange}
                                        />

                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                                        {/* Preview Area */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`
                                                relative w-full aspect-video border-4 border-dashed cursor-pointer group transition-all duration-300 overflow-hidden bg-gray-50 dark:bg-black
                                                ${formData.image ? 'border-primary' : 'border-gray-300 dark:border-gray-700 hover:border-primary'}
                                            `}
                                        >
                                            {formData.image ? (
                                                <>
                                                    <img src={formData.image} alt="Upload" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400'; }} />
                                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined text-white text-3xl mb-2">edit</span>
                                                        <span className="text-white text-[10px] font-bold uppercase">Trocar Imagem</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-primary transition-colors p-4 text-center">
                                                    <span className="material-symbols-outlined text-4xl mb-2">add_a_photo</span>
                                                    <span className="text-xs font-black uppercase">Clique para Upload</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Main Info Inputs */}
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Identificador (ID / Código)</label>
                                            <input
                                                className="w-full bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-gray-800 p-3 text-sm font-mono font-bold text-black dark:text-white focus:border-primary focus:outline-none transition-colors uppercase"
                                                placeholder="EX: PROD-001"
                                                value={formData.sku}
                                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Nome do Produto</label>
                                            <input
                                                className="w-full bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 p-4 text-lg font-black text-black dark:text-white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors uppercase rounded-none"
                                                placeholder="Nome do Produto..."
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Custo (R$)</label>
                                                <input
                                                    type="number" step="0.01"
                                                    className="w-full bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 p-3 text-sm font-mono font-bold focus:border-primary focus:outline-none rounded-none"
                                                    value={formData.cost}
                                                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Estoque Inicial</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 p-3 text-sm font-mono font-bold focus:border-primary focus:outline-none rounded-none"
                                                    value={formData.stock}
                                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold uppercase text-red-500 tracking-widest">Alerta de Estoque Mínimo</label>
                                            <input
                                                type="number"
                                                className="w-full bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900 p-3 text-sm font-mono font-bold text-red-600 focus:border-red-500 focus:outline-none rounded-none"
                                                value={formData.minStock}
                                                onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                                                placeholder="5"
                                            />
                                            <p className="text-[9px] text-gray-400">O sistema avisará quando o estoque atingir este valor.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: MATERIALS */}
                                <div className="flex flex-col bg-gray-50 dark:bg-[#000] h-full overflow-hidden relative min-h-[400px]">
                                    <div className="p-6 md:p-8 flex flex-col h-full">
                                        <h3 className="text-sm font-black uppercase text-black dark:text-white mb-4 tracking-widest flex items-center gap-2">
                                            <span className="size-2 bg-primary"></span>
                                            Insumos & Materiais
                                        </h3>

                                        {/* Add Material Bar */}
                                        <div className="flex gap-2 mb-4">
                                            <div className="flex-1">
                                                <select
                                                    className="w-full h-10 bg-white dark:bg-[#111] border-2 border-gray-300 dark:border-gray-700 px-3 text-xs font-bold uppercase focus:border-primary focus:outline-none"
                                                    value={tempMaterialName}
                                                    onChange={e => setTempMaterialName(e.target.value)}
                                                >
                                                    <option value="">Selecionar Insumo...</option>
                                                    {rawMaterials.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                                </select>
                                            </div>
                                            <input
                                                className="w-16 h-10 bg-white dark:bg-[#111] border-2 border-gray-300 dark:border-gray-700 text-center text-xs font-bold focus:border-primary focus:outline-none"
                                                placeholder="Qtd"
                                                value={tempMaterialQty}
                                                onChange={e => setTempMaterialQty(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && addMaterialToBlueprint()}
                                            />
                                            <button
                                                type="button"
                                                onClick={addMaterialToBlueprint}
                                                className="size-10 bg-primary text-white flex items-center justify-center hover:brightness-110"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>

                                        {/* Material List */}
                                        <div className="flex-1 bg-white dark:bg-[#0A0A0A] border-2 border-dashed border-gray-300 dark:border-gray-800 p-2 overflow-y-auto custom-scrollbar">
                                            {(!formData.materials || formData.materials.length === 0) ? (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                                    <span className="material-symbols-outlined text-4xl mb-2">playlist_add</span>
                                                    <span className="text-[10px] font-bold uppercase">Nenhum item adicionado</span>
                                                </div>
                                            ) : (
                                                <ul className="space-y-1">
                                                    {formData.materials.map((mat: string, idx: number) => {
                                                        const [name, qty] = mat.split(':');
                                                        return (
                                                            <li key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-gray-800 group">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-black dark:text-white uppercase line-clamp-1">{name}</span>
                                                                    <span className="text-[10px] text-gray-500 font-mono">Qtd: {qty}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeMaterialFromBlueprint(idx)}
                                                                    className="text-gray-400 hover:text-red-500"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="mt-4 flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="flex-1 py-3 text-black dark:text-white font-bold uppercase hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs border-2 border-transparent"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className={`flex-[2] py-3 bg-primary text-white font-black uppercase hover:brightness-110 shadow-[4px_4px_0px_0px_black] active:translate-y-[2px] active:shadow-none transition-all text-xs tracking-widest border-2 border-black flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <span className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></span>
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    'Salvar Produto'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};