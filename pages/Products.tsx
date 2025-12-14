import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const Products: React.FC = () => {
  const { products, updateProductStock, addProduct, updateProduct, deleteProduct, materials: rawMaterials } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs for File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - Using 'any' for cost/stock to allow intermediate string states (like "10.") during typing
  const [formData, setFormData] = useState<any>({
    name: '',
    sku: '',
    materials: [],
    cost: 0,
    stock: 0,
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
        name: '', sku: '', cost: '', stock: '', image: '', materials: []
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback image if none uploaded
    const imgUrl = formData.image?.trim() || `https://placehold.co/400x400/1a1a1a/FFF?text=${formData.name?.substring(0,3).toUpperCase()}`;

    // Ensure numbers are parsed correctly from string inputs
    const cleanData: Product = {
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock) || 0,
        materials: formData.materials || [],
        image: imgUrl
    };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...cleanData,
        id: editingProduct.id // Ensure ID is preserved
      });
    } else {
      addProduct({
        id: Math.random().toString(36).substr(2, 9),
        ...cleanData
      });
    }
    closeModal();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
                    placeholder="BUSCAR NOME OU SKU..." 
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

      {/* GRID */}
      {filteredProducts.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center opacity-50 border-4 border-dashed border-gray-300 dark:border-gray-800 p-12">
            <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
            <p className="text-xl font-bold uppercase">Nenhum produto encontrado</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr pb-8">
            {filteredProducts.map(product => (
                <div key={product.id} className="group flex flex-col bg-white dark:bg-[#1a1a1a] border-4 border-black dark:border-white hover:border-primary dark:hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#0000FF] h-full relative overflow-hidden">
                    
                    {/* TOP BADGE (SKU) */}
                    <div className="absolute top-0 left-0 bg-black dark:bg-white text-white dark:text-black px-3 py-1 z-20 border-b-2 border-r-2 border-white dark:border-black">
                         <span className="text-[10px] font-black uppercase tracking-wider">{product.sku}</span>
                    </div>

                    {/* Image Area */}
                    <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-black overflow-hidden border-b-4 border-black dark:border-white shrink-0">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a1a/FFF?text=${product.name.substring(0,3).toUpperCase()}`;
                            }}
                        />
                        {/* Stock Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 flex justify-between items-end">
                             <div className={`px-2 py-0.5 border-2 ${product.stock <= 5 ? 'bg-red-600 border-red-600 text-white animate-pulse' : 'bg-black/50 border-white text-white'}`}>
                                <span className="text-[10px] font-black uppercase">
                                    {product.stock <= 5 ? 'Estoque Crítico' : 'Disponível'}
                                </span>
                             </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1 gap-3">
                        <div>
                            <h2 className="text-black dark:text-white text-xl font-black uppercase leading-tight line-clamp-2" title={product.name}>
                                {product.name}
                            </h2>
                            <div className="w-12 h-1 bg-primary mt-2"></div>
                        </div>

                        {/* Materials Mini-BOM */}
                        <div className="flex-1 mt-2">
                             <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Especificações de Material</p>
                             <div className="bg-gray-50 dark:bg-black/50 border-l-2 border-gray-300 dark:border-gray-700 p-2 text-xs font-mono h-[80px] overflow-y-auto custom-scrollbar">
                                {product.materials.length > 0 ? (
                                    <ul className="space-y-1">
                                        {product.materials.map((m, i) => (
                                            <li key={i} className="flex justify-between text-gray-600 dark:text-gray-400">
                                                <span className="truncate pr-2">{m.split(':')[0]}</span>
                                                <span className="font-bold text-black dark:text-white">{m.split(':')[1]}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-400 italic">Sem materiais definidos.</span>
                                )}
                             </div>
                        </div>
                        
                        {/* Footer Info */}
                        <div className="mt-auto pt-3 border-t-2 border-black dark:border-white flex items-center justify-between shrink-0">
                             <div>
                                <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">Custo UN</p>
                                <p className="text-black dark:text-white text-xl font-black">R$ {product.cost.toFixed(2)}</p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2">
                                <button 
                                onClick={(e) => { e.stopPropagation(); openModal(product); }}
                                className="size-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-primary hover:text-white transition-colors brutal-btn border-2 border-transparent hover:border-black"
                                title="Editar Especificações"
                                >
                                <span className="material-symbols-outlined text-lg">settings</span>
                                </button>
                                <button 
                                onClick={(e) => { e.stopPropagation(); if(window.confirm('Excluir produto permanentemente?')) deleteProduct(product.id) }}
                                className="size-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-red-600 hover:text-white transition-colors brutal-btn border-2 border-transparent hover:border-black"
                                title="Excluir"
                                >
                                <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stock Control Bar */}
                    <div className="bg-black dark:bg-white text-white dark:text-black p-2 flex justify-between items-center gap-2 border-t-4 border-black dark:border-white shrink-0">
                         <span className="text-[10px] font-bold uppercase tracking-wider pl-2">Controle</span>
                         <div className="flex items-center bg-white dark:bg-black border-2 border-transparent">
                            <button 
                                onClick={() => updateProductStock(product.id, -1)}
                                className="size-8 flex items-center justify-center text-black dark:text-white hover:bg-red-500 hover:text-white font-bold transition-colors"
                            >-</button>
                            <span className="font-black text-lg font-mono text-black dark:text-white w-10 text-center">{product.stock}</span>
                             <button 
                                onClick={() => updateProductStock(product.id, 1)}
                                className="size-8 flex items-center justify-center text-black dark:text-white hover:bg-green-500 hover:text-white font-bold transition-colors"
                            >+</button>
                         </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* MINIMALIST BRUTALIST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in-up" onClick={closeModal}>
          <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-4xl border-4 border-primary shadow-[12px_12px_0px_0px_rgba(0,0,255,0.5)] flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            
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

            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                
                {/* LEFT: IMAGE & IDENTITY */}
                <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto border-b-4 md:border-b-0 md:border-r-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]">
                    
                    {/* Image Upload Area */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase text-primary mb-1">Visualização do Produto</label>
                        
                        {/* URL INPUT FOR HOTLINKING */}
                         <div className="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                placeholder="COLE A URL DA IMAGEM AQUI (HOTLINK)..." 
                                className="w-full bg-gray-100 dark:bg-black p-2 text-xs border-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none font-bold text-black dark:text-white placeholder:text-gray-500"
                                value={imageUrlInput}
                                onChange={handleImageUrlChange}
                            />
                        </div>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                relative w-full aspect-video border-4 border-dashed cursor-pointer group transition-all duration-300 overflow-hidden
                                ${formData.image ? 'border-primary' : 'border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900'}
                            `}
                        >
                            {formData.image ? (
                                <>
                                    <img 
                                        src={formData.image} 
                                        alt="Upload" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1a1a1a/FFF?text=IMG+ERROR'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-4xl mb-2">edit</span>
                                        <span className="text-white text-xs font-bold uppercase">Alterar Imagem</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-5xl mb-2">add_a_photo</span>
                                    <span className="text-xs font-black uppercase tracking-widest">Carregar Arquivo</span>
                                    <span className="text-[10px] font-bold mt-1 opacity-60">ou use o Hotlink acima</span>
                                </div>
                            )}
                        </div>
                        {formData.image && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setFormData((prev: any) => ({ ...prev, image: '' }));
                                    setImageUrlInput('');
                                    if(fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="self-end text-[10px] font-bold uppercase text-red-500 hover:underline"
                            >
                                Remover Imagem
                            </button>
                        )}
                    </div>
                    
                    {/* Main Info Inputs */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Nome do Produto</label>
                            <input 
                                className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 py-2 text-xl font-black text-black dark:text-white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors uppercase"
                                placeholder="EX: CADEIRA DESIGN X"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Código SKU</label>
                                <input 
                                    className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 py-2 text-sm font-mono font-bold text-black dark:text-white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors uppercase"
                                    placeholder="SKU-000"
                                    value={formData.sku}
                                    onChange={e => setFormData({...formData, sku: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase text-gray-500">Custo Base (R$)</label>
                                <input 
                                    type="number" step="0.01"
                                    className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 py-2 text-sm font-mono font-bold text-black dark:text-white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors"
                                    value={formData.cost}
                                    onChange={e => setFormData({...formData, cost: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                         <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Estoque Inicial</label>
                            <input 
                                type="number"
                                className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 py-2 text-sm font-mono font-bold text-black dark:text-white placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors"
                                value={formData.stock}
                                onChange={e => setFormData({...formData, stock: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT: MATERIALS (Clean Table) */}
                <div className="p-6 md:p-8 flex flex-col bg-gray-50 dark:bg-[#000] h-full overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl">construction</span>
                    </div>

                    <h3 className="text-sm font-black uppercase text-black dark:text-white mb-6 tracking-widest flex items-center gap-2 z-10">
                        <span className="size-2 bg-primary"></span>
                        Composição Material
                    </h3>

                    {/* Add Section */}
                    <div className="flex gap-2 mb-4 items-end z-10 bg-white dark:bg-[#111] p-3 border-2 border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Selecionar Material</label>
                            <select
                                className="w-full bg-transparent text-black dark:text-white h-8 border-b-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none text-xs font-bold uppercase"
                                value={tempMaterialName}
                                onChange={e => setTempMaterialName(e.target.value)}
                            >
                                <option value="" className="text-gray-500 bg-white dark:bg-[#111]">LISTA DE INSUMOS...</option>
                                {rawMaterials.map(m => (
                                    <option key={m.id} value={m.name} className="text-black dark:text-white bg-white dark:bg-[#111]">{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-20 flex flex-col gap-1">
                             <label className="text-[10px] font-bold uppercase text-gray-500">Qtd</label>
                             <input 
                                className="w-full bg-transparent text-black dark:text-white h-8 border-b-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none text-center text-xs font-bold"
                                placeholder="1"
                                value={tempMaterialQty}
                                onChange={e => setTempMaterialQty(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && addMaterialToBlueprint()}
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={addMaterialToBlueprint}
                            className="size-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all brutal-btn shrink-0"
                            title="Adicionar"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar border-t-4 border-black dark:border-white z-10 bg-white dark:bg-[#0A0A0A] min-h-[200px]">
                        {(!formData.materials || formData.materials.length === 0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined text-3xl mb-2 opacity-30">playlist_add</span>
                                <span className="text-[10px] font-bold uppercase">Lista Vazia</span>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 dark:bg-[#111] text-[10px] uppercase font-bold text-gray-500 sticky top-0">
                                    <tr>
                                        <th className="py-2 pl-3">Item</th>
                                        <th className="py-2 text-right">Qtd</th>
                                        <th className="py-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {formData.materials.map((mat: string, idx: number) => {
                                         const [name, qty] = mat.split(':');
                                         return (
                                            <tr key={idx} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">
                                                <td className="py-2 pl-3 font-bold text-black dark:text-white uppercase text-xs truncate max-w-[150px]">{name}</td>
                                                <td className="py-2 text-right font-mono text-gray-600 dark:text-gray-300 text-xs">{qty}</td>
                                                <td className="py-2 pr-2 text-right w-8">
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeMaterialFromBlueprint(idx)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </td>
                                            </tr>
                                         );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="col-span-1 md:col-span-2 p-4 bg-white dark:bg-[#1A1A1A] border-t-4 border-black dark:border-white flex justify-end gap-3 shrink-0 z-20">
                    <button 
                        type="button" 
                        onClick={closeModal} 
                        className="px-6 py-3 text-black dark:text-white font-black uppercase hover:text-red-500 transition-colors text-xs tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="px-8 py-3 bg-primary text-white font-black uppercase hover:brightness-110 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] active:translate-y-[2px] active:shadow-none text-xs tracking-widest flex items-center gap-2 border-2 border-black dark:border-white"
                    >
                        <span className="material-symbols-outlined text-base">save_as</span>
                        Salvar Projeto
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};