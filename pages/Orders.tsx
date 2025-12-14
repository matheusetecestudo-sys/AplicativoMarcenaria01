
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderItem, TimeRange } from '../types';

// --- CUSTOM BRUTALIST DATE PICKER COMPONENT ---
const BrutalistDatePicker: React.FC<{ value: string; onChange: (date: string) => void }> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize viewDate based on value
    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-').map(Number);
            setViewDate(new Date(y, m - 1, d));
        }
    }, [isOpen, value]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const startDay = getFirstDayOfMonth(currentYear, currentMonth); // 0 = Sunday

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
                className="w-full bg-white dark:bg-black text-black dark:text-white p-2 md:p-3 font-bold border-2 border-gray-300 dark:border-gray-700 focus:border-primary cursor-pointer flex justify-between items-center brutal-input hover:border-primary transition-colors group h-12"
            >
                <span className={`text-sm ${value ? "" : "text-gray-400"}`}>
                    {value ? new Date(value + 'T12:00:00').toLocaleDateString('pt-BR') : "SELECIONAR DATA..."}
                </span>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-lg">calendar_month</span>
            </div>

            {/* Calendar Popup */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full md:w-80 mt-2 bg-white dark:bg-[#111] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] z-50 animate-fade-in-up">
                    
                    {/* Header */}
                    <div className="bg-primary p-3 flex justify-between items-center text-white">
                        <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="hover:bg-black/20 p-1 rounded">
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        <span className="font-black uppercase tracking-wider text-sm">
                            {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="hover:bg-black/20 p-1 rounded">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1 p-2 border-b-2 border-gray-200 dark:border-gray-800">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase">{d}</div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 p-2">
                        {days.map((day, idx) => {
                            if (!day) return <div key={idx}></div>;
                            
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = value === dateStr;
                            const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                            return (
                                <button
                                    type="button"
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                                    className={`
                                        h-8 w-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-100
                                        ${isSelected 
                                            ? 'bg-primary text-white border-black dark:border-white shadow-[2px_2px_0px_0px_#000]' 
                                            : isToday 
                                                ? 'bg-transparent text-primary border-primary'
                                                : 'bg-gray-50 dark:bg-[#222] text-black dark:text-gray-300 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-black'
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Footer */}
                    <div className="p-2 border-t-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black flex justify-center">
                        <button 
                            type="button"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                const today = new Date();
                                const str = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                onChange(str);
                                setIsOpen(false);
                            }}
                            className="text-[10px] font-bold uppercase text-primary hover:underline"
                        >
                            Hoje
                        </button>
                    </div>
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

  const addItemToCart = () => {
    if (!selectedProductId || quantity <= 0) return;

    const productDetails = products.find(p => p.id === selectedProductId);
    if (!productDetails) return;

    // Price calculation logic (Cost + Margin example)
    const unitPrice = productDetails.cost * 1.5; 

    const newItem: OrderItem = {
        productId: productDetails.id,
        productName: productDetails.name,
        quantity: quantity,
        unitPrice: unitPrice,
        total: unitPrice * quantity
    };

    setCurrentItems([...currentItems, newItem]);
    
    // Reset entry inputs
    setSelectedProductId('');
    setQuantity(1);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full h-auto pb-8 items-start">
      
      {/* LEFT COLUMN: ORDER BUILDER (PDV Style) - Sticky on Desktop */}
      <div className="lg:col-span-5 flex flex-col lg:h-[calc(100vh-6rem)] h-auto lg:sticky lg:top-4 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#0000FF] transition-all relative">
        
        {/* 1. COMPACT HEADER (Client Info) */}
        <div className="p-5 border-b-4 border-black dark:border-white bg-white dark:bg-[#1A1A1A] shrink-0">
            <h2 className="text-black dark:text-white text-lg font-black uppercase mb-4 flex items-center gap-2 tracking-wide">
                <span className="material-symbols-outlined text-primary">shopping_cart_checkout</span>
                Novo Pedido
            </h2>
            
            <div className="flex flex-col gap-3">
                {/* Client Name Input */}
                <div className="relative group">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-lg">person</span>
                     <input 
                        className="w-full bg-transparent text-black dark:text-white pl-10 pr-3 py-2 text-sm font-bold border-b-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none uppercase transition-colors placeholder:text-gray-400" 
                        placeholder="Nome do Cliente" 
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4 items-end">
                    {/* Date Picker */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-wider">Entrega</label>
                        <BrutalistDatePicker value={deadline} onChange={setDeadline} />
                    </div>

                    {/* Compact Origin Toggle */}
                    <div className="flex flex-col">
                         <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-wider">Canal de Venda</label>
                         <div className="flex items-center bg-gray-100 dark:bg-black border-2 border-gray-300 dark:border-gray-700 h-12 p-1 relative">
                            {/* Sliding Background */}
                            <div 
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] transition-all duration-300 ease-out border-2 border-black dark:border-white
                                ${origin === 'ONLINE' ? 'left-1 bg-[#00FFFF]' : 'left-[calc(50%+2px)] bg-[#FFA500]'}`}
                            ></div>
                            
                            <button 
                                onClick={() => setOrigin('ONLINE')}
                                className={`flex-1 z-10 text-[10px] font-black uppercase text-center transition-colors ${origin === 'ONLINE' ? 'text-black' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                            >
                                Online
                            </button>
                            <button 
                                onClick={() => setOrigin('FISICO')}
                                className={`flex-1 z-10 text-[10px] font-black uppercase text-center transition-colors ${origin === 'FISICO' ? 'text-black' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                            >
                                Loja
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. ITEM ENTRY TOOLBAR (Dark/Contrast) */}
        <div className="bg-black dark:bg-gray-800 p-3 flex flex-col gap-2 border-b-4 border-black dark:border-white shrink-0">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-sm">barcode_reader</span>
                <span className="text-[10px] font-bold uppercase text-white/70 tracking-widest">Adicionar Produtos</span>
            </div>
            <div className="flex gap-2 h-10">
                <select 
                    className="flex-[3] bg-white dark:bg-[#111] text-black dark:text-white px-2 font-bold border-2 border-transparent focus:border-primary focus:outline-none text-xs uppercase"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                >
                    <option value="">Selecionar...</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <input 
                    type="number" 
                    min="1"
                    placeholder="QTD"
                    className="w-14 bg-white dark:bg-[#111] text-black dark:text-white text-center font-bold border-2 border-transparent focus:border-primary focus:outline-none text-xs" 
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value))}
                />
                <button 
                    onClick={addItemToCart}
                    className="w-12 bg-primary text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
                    title="Adicionar"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                </button>
            </div>
        </div>

        {/* 3. CART LIST (Receipt Style) - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111] p-0 relative min-h-[200px] custom-scrollbar">
            {currentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-400 opacity-40 h-full p-8">
                    <span className="material-symbols-outlined text-5xl mb-2">shopping_bag</span>
                    <p className="font-bold uppercase text-xs tracking-widest">Lista Vazia</p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-200 dark:bg-black/50 text-gray-500 text-[10px] uppercase font-bold sticky top-0 z-10">
                        <tr>
                            <th className="py-2 px-4">Item</th>
                            <th className="py-2 px-2 text-right">Subtotal</th>
                            <th className="py-2 px-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {currentItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-black transition-colors group">
                                <td className="py-3 px-4">
                                    <div className="font-bold text-black dark:text-white uppercase line-clamp-1">{item.productName}</div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                        {item.quantity} x R$ {item.unitPrice.toFixed(2)}
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-right font-mono font-bold text-black dark:text-white">
                                    R$ {item.total.toFixed(2)}
                                </td>
                                <td className="py-3 px-2 text-right">
                                    <button 
                                        onClick={() => removeItemFromCart(idx)} 
                                        className="size-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* 4. FOOTER (Total & Confirm) - Always visible in sticky container */}
        <div className="p-5 bg-white dark:bg-[#1A1A1A] border-t-4 border-black dark:border-white shadow-[0px_-4px_10px_rgba(0,0,0,0.05)] z-20 shrink-0">
            {/* Shipping Input */}
            <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                    Frete / Envio (Opcional)
                </label>
                <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">R$</span>
                    <input 
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-gray-100 dark:bg-black border-b-2 border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none py-1 pl-8 text-right font-mono font-bold text-sm"
                        value={shipping}
                        onChange={e => setShipping(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-between items-end mb-4 border-t-2 border-dashed border-gray-200 dark:border-gray-800 pt-2">
                <span className="text-xs font-black uppercase text-black dark:text-white tracking-widest">Total Geral</span>
                <span className="text-3xl font-black text-primary leading-none tracking-tighter">
                    R$ {calculateCartTotal().toFixed(2)}
                </span>
            </div>
            
            <div className="flex gap-3 h-12">
                <button 
                    onClick={() => { setCurrentItems([]); setShipping(''); }} 
                    className="px-4 border-2 border-gray-300 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold uppercase transition-all brutal-btn text-xs"
                >
                    Limpar
                </button>
                <button 
                    onClick={handleFinalizeOrder} 
                    className="flex-1 bg-primary text-white font-black uppercase text-sm tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] active:shadow-none active:translate-y-[2px] border-2 border-transparent"
                >
                    Confirmar Pedido
                </button>
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ORDERS LIST */}
      <div className="lg:col-span-7 bg-white dark:bg-[#1A1A1A] p-4 md:p-6 border-4 border-black dark:border-white flex flex-col h-auto min-h-[600px] transition-colors">
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
                                <div className="mb-6 space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm border-b border-dashed border-gray-300 dark:border-gray-700 pb-1">
                                            <span className="text-gray-800 dark:text-gray-200 font-bold uppercase flex items-center gap-2">
                                                <span className="size-2 bg-primary"></span>
                                                {item.quantity}x {item.productName}
                                            </span>
                                            <span className="text-gray-500 font-mono font-bold">R$ {item.total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    
                                    {order.shippingCost > 0 && (
                                        <div className="flex justify-between text-sm border-b border-dashed border-gray-300 dark:border-gray-700 pb-1 pt-1">
                                            <span className="text-gray-500 font-bold uppercase flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">local_shipping</span>
                                                Frete
                                            </span>
                                            <span className="text-gray-500 font-mono font-bold">R$ {order.shippingCost.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <span className="font-black text-xl text-primary">TOTAL: R$ {order.totalValue.toFixed(2)}</span>
                                    </div>
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
