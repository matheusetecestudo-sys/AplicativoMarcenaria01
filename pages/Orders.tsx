
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderItem, TimeRange } from '../types';

// --- CUSTOM BRUTALIST DATE PICKER COMPONENT ---
const BrutalistDatePicker: React.FC<{ value: string; onChange: (date: string) => void }> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-').map(Number);
            setViewDate(new Date(y, m - 1, d));
        }
    }, [isOpen, value]);

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const handleDateClick = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    const changeMonth = (delta: number) => {
        setViewDate(new Date(currentYear, currentMonth + delta, 1));
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-black text-black dark:text-white p-2 md:p-3 h-12 font-bold border-2 border-gray-300 dark:border-gray-700 focus:border-primary cursor-pointer flex justify-between items-center transition-all hover:border-primary group"
            >
                <span className={`text-xs md:text-sm ${value ? "opacity-100" : "opacity-40"}`}>
                    {value ? new Date(value + 'T12:00:00').toLocaleDateString('pt-BR') : "SELECIONAR DATA..."}
                </span>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-lg">calendar_month</span>
            </div>

            {/* Calendar Popup */}
            {isOpen && (
                <div className="absolute top-full left-0 w-[280px] mt-1 bg-white dark:bg-[#0A0A0A] border-4 border-black dark:border-white shadow-[10px_10px_0px_0px_#0000FF] z-[100] animate-fade-in-up">

                    {/* Header */}
                    <div className="bg-black dark:bg-white text-white dark:text-black flex items-center justify-between p-2">
                        <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="hover:bg-primary p-1 transition-colors">
                            <span className="material-symbols-outlined text-base">chevron_left</span>
                        </button>
                        <span className="font-black uppercase text-[10px] tracking-widest">
                            {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="hover:bg-primary p-1 transition-colors">
                            <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 bg-gray-100 dark:bg-white/5 py-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-[9px] font-black text-gray-400">{d}</div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 p-px">
                        {days.map((day, idx) => {
                            if (!day) return <div key={idx} className="bg-white dark:bg-[#0A0A0A] h-9"></div>;

                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = value === dateStr;
                            const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                            return (
                                <button
                                    type="button"
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                                    className={`
                                        h-9 w-full flex items-center justify-center font-bold text-xs transition-all relative
                                        ${isSelected
                                            ? 'bg-primary text-white z-10 scale-105 shadow-lg'
                                            : isToday
                                                ? 'bg-white dark:bg-[#0A0A0A] text-primary border-2 border-primary'
                                                : 'bg-white dark:bg-[#0A0A0A] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            const today = new Date();
                            onChange(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
                            setIsOpen(false);
                        }}
                        className="w-full py-2 bg-gray-50 dark:bg-black/50 text-[9px] font-black uppercase text-gray-400 hover:text-primary transition-colors border-t-2 border-gray-100 dark:border-gray-900"
                    >
                        Pular para Hoje
                    </button>
                </div>
            )}
        </div>
    );
};

export const Orders: React.FC = () => {
    const { orders, addOrder, deleteOrder, updateOrderStatus, products, timeRange, setTimeRange } = useApp();
    const [filter, setFilter] = useState('');

    // Header State
    const [clientName, setClientName] = useState('');
    const [deadline, setDeadline] = useState('');
    const [origin, setOrigin] = useState<'ONLINE' | 'FISICO'>('FISICO');
    const [shipping, setShipping] = useState<number | string>(''); // Shipping Cost

    // Cart State (Temporary Items)
    const [currentItems, setCurrentItems] = useState<OrderItem[]>([]);

    // Item Entry State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [customUnitPrice, setCustomUnitPrice] = useState<number | ''>('');
    const [currentUnitCost, setCurrentUnitCost] = useState<number>(0);

    // Layout State (Mobile)
    const [isBuilderExpanded, setIsBuilderExpanded] = useState(true);

    // Auto-update price when product changes
    useEffect(() => {
        if (selectedProductId) {
            const product = products.find(p => p.id === selectedProductId);
            if (product) {
                const defaultPrice = product.price > 0 ? product.price : product.cost * 1.5;
                setCustomUnitPrice(Number(defaultPrice.toFixed(2)));
                setCurrentUnitCost(product.cost);
            }
        } else {
            setCurrentUnitCost(0);
            setCustomUnitPrice('');
        }
    }, [selectedProductId, products]);

    const addItemToCart = () => {
        if (!selectedProductId || quantity <= 0) return;

        const productDetails = products.find(p => p.id === selectedProductId);
        if (!productDetails) return;

        const unitPrice = typeof customUnitPrice === 'number' ? customUnitPrice : productDetails.cost * 1.5;

        const newItem: OrderItem = {
            productId: productDetails.id,
            productName: productDetails.name,
            quantity: quantity,
            unitPrice: unitPrice,
            unitCost: currentUnitCost,
            total: unitPrice * quantity
        };

        setCurrentItems([...currentItems, newItem]);

        // Reset entry inputs
        setSelectedProductId('');
        setQuantity(1);
        setCustomUnitPrice('');
    };

    const removeItemFromCart = (index: number) => {
        const newItems = [...currentItems];
        newItems.splice(index, 1);
        setCurrentItems(newItems);
    };

    const calculateCartTotal = () => {
        const itemsTotal = currentItems.reduce((acc, item) => acc + item.total, 0);
        const shippingCost = typeof shipping === 'number' ? shipping : parseFloat(shipping) || 0;
        return itemsTotal + shippingCost;
    };

    const handleFinalizeOrder = () => {
        if (!clientName.trim()) {
            alert("Por favor, informe o nome do cliente.");
            return;
        }
        if (!deadline) {
            alert("Por favor, selecione uma data de entrega.");
            return;
        }
        if (currentItems.length === 0) {
            alert("Adicione pelo menos um produto ao carrinho.");
            return;
        }

        const shippingCost = typeof shipping === 'number' ? shipping : parseFloat(shipping) || 0;

        const newOrder: Order = {
            id: `#${Math.floor(1000 + Math.random() * 9000)}`, // Generates 4 digit ID
            client: clientName,
            deadline: deadline,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'PENDENTE',
            origin: origin,
            items: currentItems,
            shippingCost: shippingCost,
            totalValue: calculateCartTotal()
        };

        addOrder(newOrder);
        alert("Pedido criado com sucesso!");

        // Reset Form
        setClientName('');
        setDeadline('');
        setOrigin('FISICO');
        setShipping('');
        setCurrentItems([]);
    };

    const handleDeleteOrder = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent toggling row expansion or other click events
        if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
            deleteOrder(id);
        }
    };

    const setStatus = (id: string, status: Order['status']) => {
        updateOrderStatus(id, status);
    };

    // --- FILTER LOGIC ---
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // 1. Text Filter (Client)
            const matchesText = order.client.toLowerCase().includes(filter.toLowerCase()) ||
                order.id.toLowerCase().includes(filter.toLowerCase());

            if (!matchesText) return false;

            // 2. Time Filter
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
    }, [orders, filter, timeRange]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:h-full h-auto pb-8 items-start">

            {/* LEFT COLUMN: ORDER BUILDER (PDV Style) - Sticky on Desktop */}
            <div className={`xl:col-span-6 flex flex-col lg:h-[calc(100vh-2rem)] ${isBuilderExpanded ? 'h-[85vh]' : 'h-auto'} lg:sticky lg:top-1 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#0000FF] transition-all relative overflow-hidden`}>

                {/* 1. COMPACT HEADER (Client Info) */}
                <div className="p-3 lg:p-4 border-b-4 border-black dark:border-white bg-white dark:bg-[#1A1A1A] shrink-0">
                    <div className="flex justify-between items-center mb-2 lg:mb-3">
                        <h2 className="text-black dark:text-white text-lg md:text-xl font-black uppercase flex items-center gap-2 tracking-tighter">
                            <span className="material-symbols-outlined text-primary text-2xl">shopping_cart_checkout</span>
                            Novo Pedido
                        </h2>
                        {/* MOBILE TOGGLE BUTTON */}
                        <button
                            onClick={() => setIsBuilderExpanded(!isBuilderExpanded)}
                            className="lg:hidden p-1.5 border-2 border-black dark:border-white rounded bg-gray-100 dark:bg-black"
                        >
                            <span className="material-symbols-outlined text-sm">{isBuilderExpanded ? 'expand_less' : 'expand_more'}</span>
                        </button>
                    </div>

                    <div className={`${isBuilderExpanded ? 'grid' : 'hidden'} lg:grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3`}>
                        {/* Client Name Input */}
                        <div className="md:col-span-2 relative group">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-xl">person</span>
                            <input
                                className="w-full bg-transparent text-black dark:text-white pl-10 pr-4 py-1.5 text-base font-black border-b-2 border-gray-200 dark:border-gray-800 focus:border-primary focus:outline-none uppercase transition-colors placeholder:text-gray-300"
                                placeholder="CLIENTE..."
                                value={clientName}
                                onChange={e => setClientName(e.target.value)}
                            />
                        </div>

                        {/* Date Picker */}
                        <div className="flex flex-col">
                            <label className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-widest">Entrega</label>
                            <BrutalistDatePicker value={deadline} onChange={setDeadline} />
                        </div>

                        {/* Compact Origin Toggle */}
                        <div className="flex flex-col">
                            <label className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-widest">Canal</label>
                            <div className="flex items-center bg-gray-100 dark:bg-black border-2 border-gray-300 dark:border-gray-700 h-9 p-1 relative">
                                <div
                                    className={`absolute top-0.5 bottom-0.5 w-[calc(50%-4px)] transition-all duration-300 ease-out border-2 border-black dark:border-white
                            ${origin === 'ONLINE' ? 'left-1 bg-[#00FFFF]' : 'left-[calc(50%+2px)] bg-[#FFA500]'}`}
                                ></div>

                                <button
                                    onClick={() => setOrigin('ONLINE')}
                                    className={`flex-1 z-10 text-[8px] font-black uppercase text-center transition-colors ${origin === 'ONLINE' ? 'text-black' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                                >
                                    Online
                                </button>
                                <button
                                    onClick={() => setOrigin('FISICO')}
                                    className={`flex-1 z-10 text-[8px] font-black uppercase text-center transition-colors ${origin === 'FISICO' ? 'text-black' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                                >
                                    Loja
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY WRAPPER (Collapsible on Mobile) */}
                <div className={`${isBuilderExpanded ? 'flex' : 'hidden'} lg:flex flex-col flex-1 overflow-hidden min-h-0`}>
                    {/* 2. ITEM ENTRY TOOLBAR (Larger for Desktop) */}
                    <div className="bg-gray-50 dark:bg-black p-3 lg:p-4 flex flex-col gap-2 border-b-4 border-black dark:border-white shrink-0">
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-9 md:col-span-10">
                                <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5 tracking-widest">Produto</span>
                                <select
                                    className="w-full h-10 bg-white dark:bg-[#111] text-black dark:text-white px-3 font-black border-2 border-black dark:border-white focus:border-primary focus:outline-none text-xs uppercase"
                                    value={selectedProductId}
                                    onChange={e => setSelectedProductId(e.target.value)}
                                >
                                    <option value="">SELECIONAR PRODUTO...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-3 md:col-span-2">
                                <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5 tracking-widest">Qtd</span>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full h-10 bg-white dark:bg-[#111] text-black dark:text-white text-center font-black border-2 border-black dark:border-white focus:border-primary focus:outline-none text-base"
                                    value={quantity}
                                    onChange={e => setQuantity(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5 tracking-widest">Valor Venda Unitário</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full h-10 bg-white dark:bg-[#111] text-black dark:text-white pl-9 pr-3 font-black border-2 border-black dark:border-white focus:border-primary focus:outline-none text-base text-right"
                                        value={customUnitPrice}
                                        onChange={e => setCustomUnitPrice(parseFloat(e.target.value) || '')}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={addItemToCart}
                                className="w-12 h-10 bg-primary text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all self-end shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] border-2 border-black dark:border-white"
                                title="Adicionar"
                            >
                                <span className="material-symbols-outlined text-2xl font-black">add</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. CART LIST (Receipt Style) - Scrollable */}
                    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0A0A0A] p-0 relative min-h-[150px] lg:min-h-[200px] custom-scrollbar">
                        {currentItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-gray-300 h-full p-6">
                                <span className="material-symbols-outlined text-5xl mb-2 opacity-5">shopping_cart</span>
                                <p className="font-black uppercase text-[9px] tracking-[0.3em] opacity-10 text-center">Nenhum item adicionado ao pedido</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black dark:bg-white text-white dark:text-black text-[8px] uppercase font-black tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="py-2 px-6">Descrição</th>
                                        <th className="py-2 px-4 text-right">Faturamento</th>
                                        <th className="py-2 px-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {currentItems.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="py-2 px-6 text-black dark:text-white font-black text-xs uppercase">
                                                {item.productName}
                                                <div className="text-[9px] text-gray-400 font-bold mt-0.5">
                                                    {item.quantity} UN x R$ {item.unitPrice.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 text-right font-black text-xs text-black dark:text-white">
                                                R$ {item.total.toFixed(2)}
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                <button
                                                    onClick={() => removeItemFromCart(idx)}
                                                    className="size-6 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* 4. FOOTER (Total & Confirm) - Always visible in sticky container */}
                    <div className="p-3 lg:p-4 bg-white dark:bg-[#1A1A1A] border-t-8 border-black dark:border-white shadow-[0px_-8px_20px_rgba(0,0,0,0.1)] z-50 shrink-0">
                        {/* Shipping Input - Compact for safety */}
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">local_shipping</span>
                                Entrega
                            </label>
                            <div className="relative w-28">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">R$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-gray-800 focus:border-primary focus:outline-none py-1 pl-7 text-right font-black text-sm"
                                    value={shipping}
                                    onChange={e => setShipping(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Total and Actions Row */}
                        <div className="flex gap-2 items-stretch h-14">
                            {/* Total Block */}
                            <div className="flex-[1.2] bg-black dark:bg-white text-white dark:text-black p-2 flex flex-col justify-center items-start pl-4 relative overflow-hidden border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#0000FF]">
                                <div className="absolute top-1 right-1">
                                    <button onClick={() => { setCurrentItems([]); setShipping(''); }} title="Limpar" className="text-white/20 dark:text-black/20 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-sm">delete_forever</span>
                                    </button>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Total Geral</span>
                                <span className="text-xl font-black leading-none tracking-tighter">
                                    R$ {calculateCartTotal().toFixed(2)}
                                </span>
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleFinalizeOrder}
                                className="flex-1 bg-primary text-white font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] border-4 border-black dark:border-white flex flex-col items-center justify-center leading-tight"
                            >
                                <span className="text-sm">CONFIRMAR</span>
                                <span className="text-[7px] opacity-70 font-bold mt-0.5 tracking-tighter">GRAVAR NO SISTEMA</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: ORDERS LIST */}
            <div className="xl:col-span-6 bg-white dark:bg-[#1A1A1A] p-4 md:p-8 border-4 border-black dark:border-white flex flex-col h-auto min-h-[600px] transition-colors relative">
                {/* HEADER WITH FILTERS */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <h2 className="text-black dark:text-white text-2xl font-bold tracking-tighter uppercase">Pedidos Recentes</h2>

                        {/* Timeframe Selector (Copied from Dashboard) */}
                        <div className="flex bg-gray-100 dark:bg-[#111] p-1 border-2 border-black dark:border-white self-start md:self-auto overflow-x-auto max-w-full">
                            {(['HOJE', '7D', 'MES', 'ANO', 'TUDO'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`
                                px-2 md:px-3 py-1 text-[10px] md:text-xs font-black uppercase transition-all duration-200 whitespace-nowrap
                                ${timeRange === range
                                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_#0000FF]'
                                            : 'text-gray-500 hover:text-black dark:hover:text-white'}
                            `}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <input
                        className="w-full bg-white dark:bg-black text-black dark:text-white p-2 text-base font-bold border-4 border-black dark:border-white focus:outline-none focus:border-primary brutal-input uppercase placeholder:text-gray-500"
                        placeholder="BUSCAR CLIENTE OU ID..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center p-8 text-gray-500 font-bold uppercase border-2 border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                                <span>Nenhum pedido encontrado.</span>
                                <span className="text-xs font-normal mt-1 opacity-70">Tente ajustar o filtro de data.</span>
                            </div>
                        ) : filteredOrders.map((order) => {
                            const isLate = order.status === 'ATRASADO';
                            const isDone = order.status === 'CONCLUÍDO';
                            const isPending = order.status === 'PENDENTE';
                            const isOnline = order.origin === 'ONLINE';

                            return (
                                <div key={order.id} className={`
                            relative border-4 transition-all duration-300
                            ${isLate
                                        ? 'border-red-500 bg-red-50 dark:bg-red-950/10'
                                        : isDone
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                            : isPending
                                                ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                                                : 'border-black dark:border-white bg-white dark:bg-black'
                                    } 
                            p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]
                        `}>

                                    {/* "Mechanical" Header */}
                                    <div className={`flex justify-between items-center p-3 border-b-4 
                                ${isLate
                                            ? 'border-red-500 bg-red-500 text-white'
                                            : isDone
                                                ? 'border-green-500 bg-green-500 text-black'
                                                : isPending
                                                    ? 'border-yellow-400 bg-yellow-400 text-black'
                                                    : 'border-black dark:border-white bg-gray-100 dark:bg-[#222]'
                                        }`}>
                                        <div className="flex flex-col">
                                            <span className={`font-black text-lg uppercase ${isLate ? 'text-white' : isDone || isPending ? 'text-black' : 'text-black dark:text-white'}`}>{order.client}</span>
                                            <span className={`text-xs font-bold uppercase ${isLate ? 'text-white/80' : isDone || isPending ? 'text-black/70' : 'text-gray-500'}`}>
                                                {order.id} • {new Date(order.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div
                                                className={`h-10 px-3 flex items-center justify-center border-2 font-black uppercase text-xs tracking-wider 
                                            ${isOnline ? 'bg-[#00FFFF] text-black border-black' : 'bg-[#FFA500] text-black border-black'}`}
                                                title={isOnline ? "Pedido via Internet" : "Pedido em Loja Física"}
                                            >
                                                {isOnline ? 'ONLINE' : 'LOJA'}
                                            </div>

                                            <button
                                                onClick={(e) => handleDeleteOrder(e, order.id)}
                                                className={`size-10 flex items-center justify-center bg-transparent border-2 border-black/30 dark:border-white/30 text-black/50 dark:text-white/50 hover:text-white hover:bg-black hover:border-black transition-all brutal-btn ${isLate || isDone || isPending ? 'border-black/50 text-black/50 hover:bg-white hover:text-red-500' : ''}`}
                                                title="Excluir Pedido"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        {/* Order Items Summary */}
                                        <div className="mb-4 space-y-2 border-b-2 border-dashed border-gray-200 dark:border-gray-800 pb-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-800 dark:text-gray-200 font-bold uppercase flex items-center gap-2">
                                                        <span className="size-2 bg-primary"></span>
                                                        {item.quantity}x {item.productName}
                                                    </span>
                                                    <span className="text-gray-500 font-mono font-bold">R$ {item.total.toFixed(2)}</span>
                                                </div>
                                            ))}

                                            {order.shippingCost > 0 && (
                                                <div className="flex justify-between text-sm py-1 text-gray-400">
                                                    <span className="font-bold uppercase flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                                                        Frete
                                                    </span>
                                                    <span className="font-mono font-bold">R$ {order.shippingCost.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Financial Summary Block - Explicit Breakdown */}
                                        <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 dark:bg-black p-3 border-t-2 border-b-2 border-gray-200 dark:border-gray-800">
                                            {/* Revenue */}
                                            <div className="flex flex-col items-center border-r border-gray-200 dark:border-gray-800">
                                                <span className="text-[8px] font-black uppercase text-blue-500 mb-1">Faturamento</span>
                                                <span className="font-black text-sm text-blue-600 dark:text-blue-400">R$ {order.totalValue.toFixed(2)}</span>
                                            </div>

                                            {/* Cost (Calculated) */}
                                            {(() => {
                                                const totalCost = order.items.reduce((acc, item) => acc + ((item.unitCost || 0) * item.quantity), 0);
                                                const finalCost = totalCost + (order.shippingCost || 0);
                                                const profit = order.totalValue - finalCost;
                                                const margin = order.totalValue > 0 ? (profit / order.totalValue) * 100 : 0;

                                                return (
                                                    <>
                                                        <div className="flex flex-col items-center border-r border-gray-200 dark:border-gray-800">
                                                            <span className="text-[8px] font-black uppercase text-red-400 mb-1">Custo Total</span>
                                                            <span className="font-bold text-sm text-gray-500">R$ {finalCost.toFixed(2)}</span>
                                                        </div>

                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[8px] font-black uppercase text-green-500 mb-1">Lucro Real</span>
                                                            <div className="flex flex-col items-center leading-none">
                                                                <span className="font-black text-sm text-green-600 dark:text-green-500">R$ {profit.toFixed(2)}</span>
                                                                <span className="text-[8px] font-bold text-green-400 mt-1">{margin.toFixed(0)}%</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        {/* INDUSTRIAL CONTROL PANEL (STATUS BUTTONS) */}
                                        <div className="mt-4 p-3 bg-gray-100 dark:bg-[#111] border-2 border-gray-300 dark:border-gray-800">
                                            <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">settings_input_component</span>
                                                Painel de Controle de Status
                                            </p>

                                            <div className="grid grid-cols-3 gap-2">

                                                {/* PENDENTE BUTTON */}
                                                <button
                                                    onClick={() => setStatus(order.id, 'PENDENTE')}
                                                    className={`
                                                relative h-10 border-2 font-black uppercase text-[10px] md:text-xs tracking-wider transition-all duration-75
                                                ${isPending
                                                            ? 'bg-[#FFFF00] text-black border-black shadow-[2px_2px_0px_black] dark:shadow-[2px_2px_0px_white] translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-none'
                                                            : 'bg-transparent text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95'}
                                            `}
                                                >
                                                    Pendente
                                                    {isPending && <span className="absolute top-1 right-1 size-1.5 bg-black rounded-full animate-ping"></span>}
                                                </button>

                                                {/* CONCLUÍDO BUTTON */}
                                                <button
                                                    onClick={() => setStatus(order.id, 'CONCLUÍDO')}
                                                    className={`
                                                relative h-10 border-2 font-black uppercase text-[10px] md:text-xs tracking-wider transition-all duration-75
                                                ${isDone
                                                            ? 'bg-[#00FF00] text-black border-black shadow-[2px_2px_0px_black] dark:shadow-[2px_2px_0px_white] translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-none'
                                                            : 'bg-transparent text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95'}
                                            `}
                                                >
                                                    Concluído
                                                    {isDone && <span className="absolute top-1 right-1 size-1.5 bg-black rounded-full"></span>}
                                                </button>

                                                {/* ATRASADO ALERT (Read Only) */}
                                                <div
                                                    className={`
                                                relative h-10 border-2 font-black uppercase text-[10px] md:text-xs tracking-wider transition-all duration-200 flex items-center justify-center cursor-default
                                                ${isLate
                                                            ? 'bg-[#FF0000] text-white border-black shadow-[2px_2px_0px_black] dark:shadow-[2px_2px_0px_white] translate-x-[-2px] translate-y-[-2px] animate-pulse'
                                                            : 'bg-transparent text-gray-300 border-gray-200 dark:border-gray-800 opacity-50'}
                                            `}
                                                    title="Automático: O sistema detectou atraso na entrega"
                                                >
                                                    Atrasado
                                                    {isLate && <span className="absolute top-1 right-1 size-1.5 bg-white rounded-full animate-ping"></span>}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
