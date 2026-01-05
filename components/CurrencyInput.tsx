import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
    value: number | string;
    onChange: (value: number) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
    value,
    onChange,
    className = '',
    placeholder = 'R$ 0,00',
    disabled = false,
    required = false
}) => {
    const [displayValue, setDisplayValue] = useState('');

    // Format number to BRL currency display
    const formatToBRL = (num: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    // Update display when value prop changes
    useEffect(() => {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        setDisplayValue(formatToBRL(numValue));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digit characters
        const rawValue = e.target.value.replace(/\D/g, '');

        // Convert to number (cents to reais)
        const numberValue = parseInt(rawValue || '0') / 100;

        // Update display
        setDisplayValue(formatToBRL(numberValue));

        // Call parent onChange with numeric value
        onChange(numberValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // Select all on focus for easy editing
        e.target.select();
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            className={className}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
        />
    );
};
