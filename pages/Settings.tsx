
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TimeRange } from '../types';

// Simple Brutalist Toggle Switch Component
const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: () => void; icon: string }> = ({ label, checked, onChange, icon }) => (
    <div
        onClick={onChange}
        className={`
            cursor-pointer flex justify-between items-center p-4 border-2 transition-all brutal-btn select-none
            ${checked
                ? 'bg-primary border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF]'
                : 'bg-white dark:bg-black border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'}
        `}
    >
        <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined ${checked ? 'text-white' : 'text-gray-400'}`}>{icon}</span>
            <span className={`font-bold uppercase text-xs tracking-wider ${checked ? 'text-white' : 'text-gray-500'}`}>{label}</span>
        </div>
        <div className={`w-12 h-6 flex items-center p-1 border-2 transition-colors ${checked ? 'bg-black border-white justify-end' : 'bg-gray-200 dark:bg-gray-800 border-gray-400 justify-start'}`}>
            <div className={`size-3 bg-white dark:bg-white`}></div>
        </div>
    </div>
);

export const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { settings, updateSettings, exportData, importData, resetApp, orders, products, materials, logout, timeRange, setTimeRange } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Local state for the form to allow "Save" action
    const [companyForm, setCompanyForm] = useState(settings.company);

    // --- MASKING UTILS ---
    const maskCNPJ = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    // Handlers
    const handleLocalChange = (key: keyof typeof settings.company, value: string) => {
        let finalValue = value;
        if (key === 'cnpj') finalValue = maskCNPJ(value);
        if (key === 'contact') finalValue = maskPhone(value);

        setCompanyForm(prev => ({ ...prev, [key]: finalValue }));

        if (key === 'logo' && value === '' && logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    const saveCompanyChanges = async () => {
        await updateSettings({ company: companyForm });
        alert('Informações da empresa atualizadas com sucesso!');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleLocalChange('logo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
        if (logoInputRef.current) logoInputRef.current.value = '';
    };

    const handleThemeToggle = () => {
        const newTheme = settings.appearance.theme === 'Escuro' ? 'Claro' : 'Escuro';
        updateSettings({ appearance: { ...settings.appearance, theme: newTheme } });
    };

    const handleDensityToggle = () => {
        const newDensity = settings.appearance.density === 'COMPACTO' ? 'PADRAO' : 'COMPACTO';
        updateSettings({ appearance: { ...settings.appearance, density: newDensity } });
    };

    const toggleNotification = (key: 'lowStock' | 'deadlines') => {
        updateSettings({ notifications: { ...settings.notifications, [key]: !settings.notifications[key] } });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = importData(e.target?.result as string);
            alert(success ? 'Dados restaurados com sucesso! O sistema foi atualizado.' : 'Erro ao importar arquivo. Verifique se o formato é válido.');
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleReset = () => {
        const userInput = window.prompt(
            "⚠️ ZONA DE PERIGO ⚠️\n\nEsta ação apagará TODOS os pedidos, produtos, estoque e configurações do sistema.\nEssa ação é IRREVERSÍVEL.\n\nPara confirmar, digite a palavra: CONFIRMAR"
        );

        if (userInput === "CONFIRMAR") {
            resetApp();
        } else if (userInput !== null) {
            alert("Ação cancelada. Código de confirmação incorreto.");
        }
    };

    const handleLogout = () => {
        if (window.confirm('Deseja desconectar e voltar para a tela de login?')) {
            logout(); // Call logout context
            navigate('/login');
        }
    };

    // Report Generation Logic
    const handleGenerateReport = () => {
        // Filter Logic
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
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

        const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.totalValue, 0);
        const totalCostEstimate = filteredOrders.reduce((acc, order) => {
            let orderCost = 0;
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const unitCost = product ? product.cost : (item.unitPrice * 0.6);
                orderCost += (unitCost * item.quantity);
            });
            return acc + orderCost;
        }, 0);
        const totalProfit = totalRevenue - totalCostEstimate;
        // Calculate stock values
        const totalProductValue = products.reduce((acc, p) => acc + (p.cost * p.stock), 0);
        const totalMaterialValue = materials.reduce((acc, m) => acc + (m.costPerUnit * m.stock), 0);
        const criticalMaterials = materials.filter(m => m.stock <= m.minStock);

        // --- TOP PRODUCTS ANALYSIS ---
        const productStats: Record<string, { quantity: number, revenue: number }> = {};

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                if (!productStats[item.productName]) {
                    productStats[item.productName] = { quantity: 0, revenue: 0 };
                }
                productStats[item.productName].quantity += item.quantity;
                productStats[item.productName].revenue += item.total;
            });
        });

        const topProducts = Object.entries(productStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5); // Get Top 5

        const maxRevenue = Math.max(...topProducts.map(p => p.revenue), 1); // Avoid div by zero

        const reportContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Relatório Gerencial - ${settings.company.name}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700;900&display=swap');
                    @page { size: A4; margin: 10mm; }
                    body { font-family: 'Space Grotesk', sans-serif; color: #000; background: #fff; line-height: 1.3; -webkit-print-color-adjust: exact; margin: 20px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
                    .logo-box { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border: 2px solid #000; }
                    .logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
                    .company-name { font-size: 28px; font-weight: 900; text-transform: uppercase; }
                    .report-type { font-size: 12px; font-weight: bold; text-transform: uppercase; background: #000; color: #fff; padding: 2px 8px; }
                    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .kpi-box { border: 2px solid #000; padding: 15px; }
                    .kpi-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #555; }
                    .kpi-value { font-size: 24px; font-weight: 900; margin-top: 5px; }
                    .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; margin-bottom: 15px; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; font-size: 10px; border: 2px solid #000; }
                    th { background: #000; color: #fff; padding: 8px; text-align: left; }
                    td { padding: 6px 8px; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; }
                    .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; text-transform: uppercase; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
                    
                    /* Bar Chart CSS */
                    .bar-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 10px; }
                    .bar-label { width: 180px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .bar-track { flex: 1; background: #eee; height: 14px; margin: 0 10px; border: 1px solid #ddd; }
                    .bar-fill { background: #000; height: 100%; }
                    .bar-value { width: 90px; text-align: right; font-weight: bold; font-family: monospace; font-size: 11px; }
                    .bar-sub { width: 60px; text-align: right; color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <div class="logo-box">${settings.company.logo ? `<img src="${settings.company.logo}" class="logo-img" />` : '<span style="font-size:30px; font-weight:900;">M</span>'}</div>
                        <div>
                            <div class="company-name">${settings.company.name}</div>
                            <div style="font-size: 11px;">${settings.company.cnpj || 'Documento N/A'}</div>
                        </div>
                    </div>
                    <div>
                        <div class="report-type">Relatório Gerencial</div>
                        <div style="font-size: 12px; margin-top: 5px; font-weight: bold;">${new Date().toLocaleDateString('pt-BR')}</div>
                        <div style="font-size: 10px; margin-top: 2px;">Período: ${timeRange}</div>
                    </div>
                </div>
                
                <div class="section-title"><span>Resumo Financeiro (${timeRange})</span></div>
                <div class="grid-3">
                    <div class="kpi-box"><div class="kpi-title">Faturamento</div><div class="kpi-value" style="color: blue;">R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                    <div class="kpi-box"><div class="kpi-title">Custos Estimados</div><div class="kpi-value" style="color: red;">R$ ${totalCostEstimate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                    <div class="kpi-box"><div class="kpi-title">Lucro Operacional</div><div class="kpi-value" style="color: green;">R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
                </div>

                <div class="section-title"><span>Top 5 Produtos (Receita Gerada)</span></div>
                <div style="border: 2px solid #000; padding: 20px; margin-bottom: 30px;">
                    ${topProducts.length > 0 ? topProducts.map(p => `
                        <div class="bar-row">
                            <div class="bar-label">${p.name}</div>
                            <div class="bar-track">
                                <div class="bar-fill" style="width: ${(p.revenue / maxRevenue) * 100}%;"></div>
                            </div>
                            <div class="bar-value">R$ ${p.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div class="bar-sub">(${p.quantity} un)</div>
                        </div>
                    `).join('') : '<div style="text-align:center; padding: 20px; color: #888;">Nenhuma venda registrada neste período.</div>'}
                </div>

                <div class="section-title"><span>Insumos em Alerta (Baixo Estoque)</span></div>
                <table>
                    <thead><tr><th>Insumo</th><th>Atual</th><th>Mínimo</th><th>Status</th></tr></thead>
                    <tbody>${criticalMaterials.length > 0 ? criticalMaterials.slice(0, 8).map(m => `<tr><td>${m.name}</td><td>${m.stock} ${m.unit}</td><td>${m.minStock}</td><td style="color:red; font-weight:bold;">REPOR</td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center;">Estoque operando normalmente.</td></tr>'}</tbody>
                </table>
                <div class="footer">Gerado por Rino Score System • ${new Date().getFullYear()}</div>
            </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) { printWindow.document.write(reportContent); printWindow.document.close(); setTimeout(() => { printWindow.print(); }, 500); }
    };

    const isDark = settings.appearance.theme === 'Escuro';

    return (
        <div className="w-full h-full pb-12">
            {/* Header */}
            <header className="mb-8 border-b-4 border-primary pb-4 animate-fade-in-up">
                <h1 className="text-black dark:text-white text-4xl md:text-6xl font-black uppercase tracking-[-0.05em] leading-none transition-colors">Configurações</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-bold uppercase tracking-widest mt-2">Parâmetros do Sistema</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

                {/* 1. IDENTITY SECTION */}
                <div className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-6 shadow-sm animate-fade-in-up stagger-1">
                    <div className="flex items-center gap-2 mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
                        <span className="material-symbols-outlined text-primary text-2xl">business</span>
                        <h2 className="text-xl font-black uppercase text-black dark:text-white">Identidade Corporativa</h2>
                    </div>

                    {/* FORM CONTAINER */}
                    <div className="flex flex-col md:flex-row gap-8">

                        {/* LOGO UPLOAD */}
                        <div className="flex flex-col gap-3 shrink-0 items-center md:items-start">
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Seu Logotipo</span>
                            <div
                                onClick={() => logoInputRef.current?.click()}
                                className="size-40 border-4 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary cursor-pointer flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-black group transition-all hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
                            >
                                {companyForm.logo ? (
                                    <img src={companyForm.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="text-center text-gray-400 group-hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                        <p className="text-[10px] font-black uppercase mt-2">Carregar Imagem</p>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                            {companyForm.logo && (
                                <button
                                    onClick={() => handleLocalChange('logo', '')}
                                    className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600 hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span> Remover Logo
                                </button>
                            )}
                        </div>

                        {/* INPUT FIELDS */}
                        <div className="flex-1 flex flex-col gap-5 justify-center">
                            <label className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Nome da Empresa</span>
                                <input
                                    className="w-full bg-gray-50 dark:bg-black/50 border-b-4 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none p-3 text-xl font-black text-black dark:text-white uppercase transition-all brutal-input placeholder-gray-300 dark:placeholder-gray-700"
                                    value={companyForm.name}
                                    onChange={(e) => handleLocalChange('name', e.target.value)}
                                    placeholder="SUA MARCENARIA"
                                />
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">CNPJ / Documento</span>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-black/50 border-b-4 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none p-3 text-sm font-bold font-mono text-black dark:text-white uppercase transition-all brutal-input"
                                        value={companyForm.cnpj}
                                        onChange={(e) => handleLocalChange('cnpj', e.target.value)}
                                        placeholder="00.000.000/0000-00"
                                        maxLength={18}
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Contato (Tel/WhatsApp)</span>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-black/50 border-b-4 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none p-3 text-sm font-bold text-black dark:text-white uppercase transition-all brutal-input"
                                        value={companyForm.contact}
                                        onChange={(e) => handleLocalChange('contact', e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                    />
                                </label>
                            </div>

                            {/* SAVE BUTTON */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={saveCompanyChanges}
                                    className="bg-black dark:bg-white text-white dark:text-black py-3 px-6 font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none brutal-btn flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">save</span>
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. REPORT GENERATION */}
                <div className="bg-primary p-6 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] flex flex-col justify-between animate-fade-in-up stagger-2">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-white"><span className="material-symbols-outlined text-3xl">print</span><h2 className="text-xl font-black uppercase">Relatórios</h2></div>
                        <p className="text-white/80 text-sm font-medium mb-6 leading-relaxed">Gere um relatório executivo com os produtos mais vendidos e resumo financeiro. Selecione o período:</p>

                        {/* Time Filter for Report */}
                        <div className="flex bg-black/20 p-1 border-2 border-white/50 mb-6">
                            {(['HOJE', '7D', 'MES', 'ANO', 'TUDO'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`
                                        flex-1 py-2 text-[10px] font-black uppercase transition-all duration-200
                                        ${timeRange === range
                                            ? 'bg-white text-primary'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'}
                                    `}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleGenerateReport} className="w-full py-4 bg-white text-black font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none brutal-btn border-2 border-transparent">Gerar Documento</button>
                </div>

                {/* 3. INTERFACE & PREFERENCES */}
                <div className="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white p-6 animate-fade-in-up stagger-3 flex flex-col">
                    <div className="flex items-center gap-2 mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
                        <span className="material-symbols-outlined text-primary text-2xl">tune</span>
                        <h2 className="text-xl font-black uppercase text-black dark:text-white">Preferências</h2>
                    </div>

                    {/* Animated Theme Toggle */}
                    <button
                        onClick={handleThemeToggle}
                        className="w-full py-6 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-black border-4 border-black dark:border-white hover:border-primary dark:hover:border-primary transition-all group brutal-btn shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-[2px] active:shadow-none mb-6"
                    >
                        <span className={`material-symbols-outlined text-5xl text-black dark:text-white transition-transform duration-500 ${isDark ? 'rotate-180' : 'rotate-0'}`}>
                            {isDark ? 'dark_mode' : 'light_mode'}
                        </span>
                        <span className="font-black uppercase tracking-widest text-xs text-gray-500 group-hover:text-primary">
                            Alternar Tema: {isDark ? 'Noturno' : 'Diurno'}
                        </span>
                    </button>

                    {/* Toggle Switches */}
                    <div className="flex flex-col gap-3">
                        <ToggleSwitch
                            label="Modo Compacto"
                            icon="compress"
                            checked={settings.appearance.density === 'COMPACTO'}
                            onChange={handleDensityToggle}
                        />
                        <ToggleSwitch
                            label="Alertas de Estoque"
                            icon="inventory"
                            checked={settings.notifications.lowStock}
                            onChange={() => toggleNotification('lowStock')}
                        />
                        <ToggleSwitch
                            label="Alertas de Prazo"
                            icon="timer"
                            checked={settings.notifications.deadlines}
                            onChange={() => toggleNotification('deadlines')}
                        />
                    </div>
                </div>

                {/* 4. DATA MANAGEMENT */}
                <div className="lg:col-span-2 bg-gray-50 dark:bg-[#111] border-4 border-black dark:border-white p-6 animate-fade-in-up stagger-4">
                    <div className="flex items-center gap-2 mb-6 border-b-2 border-gray-200 dark:border-gray-800 pb-2"><span className="material-symbols-outlined text-black dark:text-white text-2xl">database</span><h2 className="text-xl font-black uppercase text-black dark:text-white">Gestão de Dados</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={exportData} className="py-4 px-4 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all brutal-btn flex flex-col items-center gap-2"><span className="material-symbols-outlined">download</span><span className="text-xs tracking-widest">Backup (JSON)</span></button>
                        <div className="relative"><input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" /><button onClick={() => fileInputRef.current?.click()} className="w-full h-full py-4 px-4 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all brutal-btn flex flex-col items-center gap-2"><span className="material-symbols-outlined">upload</span><span className="text-xs tracking-widest">Restaurar</span></button></div>
                        <button onClick={handleReset} className="py-4 px-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold uppercase hover:bg-red-500 hover:text-white transition-all brutal-btn flex flex-col items-center gap-2"><span className="material-symbols-outlined">delete_forever</span><span className="text-xs tracking-widest">Resetar Fábrica</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
