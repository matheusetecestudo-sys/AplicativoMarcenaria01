
import React, { useState } from 'react';

export const Calculator: React.FC = () => {
  const [materials, setMaterials] = useState([{ name: '', cost: 0 }]);
  const [laborCostPerUnit, setLaborCostPerUnit] = useState<number | string>(''); // Allow empty for optional
  const [shippingCost, setShippingCost] = useState<number | string>(''); // Optional Shipping
  const [margin, setMargin] = useState(30);
  const [projectName, setProjectName] = useState('');

  const addMaterial = () => setMaterials([...materials, { name: '', cost: 0 }]);
  
  const updateMaterial = (index: number, field: 'name' | 'cost', value: string | number) => {
    const newMaterials = [...materials];
    if (field === 'cost') {
        newMaterials[index].cost = parseFloat(value as string) || 0;
    } else {
        newMaterials[index].name = value as string;
    }
    setMaterials(newMaterials);
  };

  const removeMaterial = (index: number) => {
      const newMaterials = materials.filter((_, i) => i !== index);
      setMaterials(newMaterials);
  };

  const totalMaterialCost = materials.reduce((acc, curr) => acc + curr.cost, 0);
  const labor = typeof laborCostPerUnit === 'number' ? laborCostPerUnit : parseFloat(laborCostPerUnit) || 0;
  const shipping = typeof shippingCost === 'number' ? shippingCost : parseFloat(shippingCost) || 0;
  
  const totalProductionCost = totalMaterialCost + labor;
  const profit = totalProductionCost * (margin / 100);
  const finalPrice = totalProductionCost + profit + shipping;

  const reset = () => {
    setMaterials([{ name: '', cost: 0 }]);
    setLaborCostPerUnit('');
    setShippingCost('');
    setMargin(30);
    setProjectName('');
  };

  return (
    <div className="w-full h-full pb-12">
      {/* Header Section */}
      <header className="mb-8 border-b-4 border-primary pb-6 animate-fade-in-up">
         <h1 className="text-black dark:text-white text-4xl md:text-6xl font-black leading-none tracking-tighter uppercase mb-2 transition-colors">
            Calculadora
         </h1>
         <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm md:text-base">
            Estimativa de Custos & Precificação
         </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INPUTS (Spans 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* 1. Project Identity */}
            <div className="bg-white dark:bg-[#1A1A1A] p-6 border-4 border-black dark:border-white shadow-sm animate-fade-in-up stagger-1">
                <label className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase text-primary tracking-widest">01. Identificação do Projeto</span>
                    <input 
                        className="w-full bg-transparent text-black dark:text-white text-2xl md:text-3xl font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700 border-b-4 border-black dark:border-white focus:border-primary focus:outline-none transition-colors py-2 uppercase" 
                        placeholder="NOME DO PROJETO..." 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                </label>
            </div>

            {/* 2. Materials List */}
            <div className="bg-white dark:bg-[#1A1A1A] p-6 border-4 border-black dark:border-white shadow-sm flex flex-col gap-6 animate-fade-in-up stagger-2">
                <div className="flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-800 pb-2">
                    <span className="text-xs font-black uppercase text-primary tracking-widest">02. Insumos & Custos Diretos</span>
                    <span className="text-xs font-bold uppercase text-black dark:text-white px-2 py-1 bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700">{materials.length} Itens</span>
                </div>
                
                <div className="flex flex-col gap-3">
                    {materials.map((mat, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center group animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <span className="hidden sm:block text-gray-400 font-mono text-xs font-bold w-6">{(index + 1).toString().padStart(2, '0')}</span>
                            <input 
                                className="flex-1 w-full bg-gray-50 dark:bg-black text-black dark:text-white p-3 border-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none font-bold uppercase text-sm brutal-input transition-colors" 
                                placeholder="DESCRIÇÃO DO MATERIAL"
                                value={mat.name}
                                onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                            />
                            <div className="flex gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-40">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">R$</span>
                                    <input 
                                        className="w-full bg-gray-50 dark:bg-black text-black dark:text-white p-3 pl-10 border-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none font-bold text-sm brutal-input text-right transition-colors" 
                                        placeholder="0.00"
                                        type="number"
                                        value={mat.cost || ''}
                                        onChange={(e) => updateMaterial(index, 'cost', e.target.value)}
                                    />
                                </div>
                                {materials.length > 1 && (
                                    <button 
                                        onClick={() => removeMaterial(index)} 
                                        className="px-3 bg-red-100 dark:bg-red-900/20 text-red-600 border-2 border-transparent hover:border-red-500 hover:text-red-500 transition-colors brutal-btn"
                                        title="Remover Item"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={addMaterial} 
                    className="self-start py-3 px-6 bg-black dark:bg-white text-white dark:text-black font-bold uppercase hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all border-2 border-transparent brutal-btn text-sm tracking-wide flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-y-[2px]"
                >
                    <span className="material-symbols-outlined text-lg">add</span> Adicionar Insumo
                </button>
            </div>

            {/* 3. Variables */}
            <div className="bg-white dark:bg-[#1A1A1A] p-6 border-4 border-black dark:border-white shadow-sm animate-fade-in-up stagger-3">
                 <div className="flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-800 pb-4 mb-4">
                    <span className="text-xs font-black uppercase text-primary tracking-widest">03. Variáveis & Lucro</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="text-sm font-bold uppercase text-black dark:text-white">Mão de Obra (Unitário)</span>
                            <span className="text-[10px] font-bold uppercase bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-sm text-gray-600 dark:text-gray-400">Opcional</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                            <input 
                                className="w-full bg-gray-50 dark:bg-black text-black dark:text-white p-4 pl-12 border-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none font-bold text-lg brutal-input transition-colors" 
                                placeholder="0.00" 
                                type="number"
                                value={laborCostPerUnit}
                                onChange={(e) => setLaborCostPerUnit(e.target.value)}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="text-sm font-bold uppercase text-black dark:text-white">Frete / Envio</span>
                            <span className="text-[10px] font-bold uppercase bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-sm text-gray-600 dark:text-gray-400">Opcional</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                            <input 
                                className="w-full bg-gray-50 dark:bg-black text-black dark:text-white p-4 pl-12 border-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none font-bold text-lg brutal-input transition-colors" 
                                placeholder="0.00" 
                                type="number"
                                value={shippingCost}
                                onChange={(e) => setShippingCost(e.target.value)}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-bold uppercase text-black dark:text-white">Margem de Lucro (%)</span>
                        <div className="relative">
                             <input 
                                className="w-full bg-gray-50 dark:bg-black text-black dark:text-white p-4 border-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none font-bold text-lg brutal-input transition-colors" 
                                placeholder="30" 
                                type="number"
                                value={margin}
                                onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: RECEIPT (Spans 5 cols) - Sticky */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 animate-fade-in-up stagger-4">
            <div className="bg-white dark:bg-[#1A1A1A] border-4 border-primary p-0 shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#FFF] transition-all relative overflow-hidden flex flex-col">
                
                {/* Receipt Header */}
                <div className="bg-primary p-4 text-center border-b-4 border-black dark:border-white">
                    <h2 className="text-white text-xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">receipt_long</span>
                        Estimativa Final
                    </h2>
                </div>

                <div className="p-8 flex flex-col gap-4 relative bg-[#f9fafb] dark:bg-[#111] [background-image:radial-gradient(#ccc_1px,transparent_1px)] dark:[background-image:radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]">
                    
                    {/* Project Name on Receipt */}
                    <div className="text-center mb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-4">
                        <span className="text-[10px] font-black uppercase text-gray-500">Projeto</span>
                        <p className="text-xl font-black uppercase text-black dark:text-white break-words">{projectName || 'SEM NOME'}</p>
                    </div>

                    {/* Items Summary */}
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                        <span className="uppercase font-bold text-sm">Materiais ({materials.length})</span>
                        <span className="font-mono font-bold text-lg">R$ {totalMaterialCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                        <span className="uppercase font-bold text-sm">Mão de Obra</span>
                        <span className="font-mono font-bold text-lg">R$ {labor.toFixed(2)}</span>
                    </div>

                    {/* Divider Style "Tear" */}
                    <div className="my-2 border-b-2 border-dashed border-gray-400 dark:border-gray-600 w-full relative"></div>

                    <div className="flex justify-between items-center text-black dark:text-white">
                        <span className="uppercase font-black text-base">Custo Produção</span>
                        <span className="font-mono font-bold text-xl">R$ {totalProductionCost.toFixed(2)}</span>
                    </div>

                     <div className="flex justify-between items-center text-green-600 dark:text-green-500">
                        <span className="uppercase font-bold text-sm">Lucro ({margin}%)</span>
                        <span className="font-mono font-bold text-lg">+ R$ {profit.toFixed(2)}</span>
                    </div>

                    {shipping > 0 && (
                        <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 pt-1">
                            <span className="uppercase font-bold text-sm">Frete</span>
                            <span className="font-mono font-bold text-lg">+ R$ {shipping.toFixed(2)}</span>
                        </div>
                    )}

                     {/* Final Total */}
                    <div className="mt-6 pt-6 border-t-4 border-black dark:border-white flex flex-col items-center gap-1 bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-sm transform rotate-1">
                        <span className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">Preço Final Sugerido</span>
                        <span className="text-primary text-5xl md:text-6xl font-black tracking-tighter tabular-nums">
                            R$ {finalPrice.toFixed(2)}
                        </span>
                    </div>
                    
                    {/* Fake Barcode */}
                    <div className="mt-4 flex justify-center opacity-40">
                         <div className="h-8 w-48 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABCAYAAAD5PA/NAAAAFklEQVR42mN88P/TfwYGBgYGCAMBAwAWjQSA+F+hQwAAAABJRU5ErkJggg==')] bg-repeat-x bg-contain"></div>
                    </div>

                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 dark:bg-black border-t-4 border-primary flex gap-4">
                     <button 
                        onClick={reset} 
                        className="w-full py-4 text-red-500 font-black uppercase hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm brutal-btn border-2 border-transparent flex items-center justify-center gap-2"
                     >
                        <span className="material-symbols-outlined">restart_alt</span>
                        Novo Cálculo
                    </button>
                </div>
            </div>
        </div>
      
      </div>
    </div>
  );
};
