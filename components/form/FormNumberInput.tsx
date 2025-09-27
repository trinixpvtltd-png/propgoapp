import React from 'react';
import { FormTextInput } from './FormTextInput';
import { TextInputProps } from 'react-native';

type Base = Omit<TextInputProps, 'style' | 'onChangeText' | 'value' | 'keyboardType' | 'onChange'>;

interface Props extends Base {
  label: string;
  value: number | undefined;
  onValueChange: (val: number | undefined) => void;
  error?: string;
  helperText?: string;
  min?: number;
  max?: number;
  integer?: boolean;
}

export const FormNumberInput: React.FC<Props> = ({ label, value, onValueChange, error, helperText, min, max, integer, ...rest }) => {
  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    if (cleaned === '') { onValueChange(undefined); return; }
    if (integer && cleaned.includes('.')) return; // ignore decimals for integer field
    const num = Number(cleaned);
    if (Number.isNaN(num)) { onValueChange(undefined); return; }
    if (min !== undefined && num < min) { onValueChange(num); return; }
    if (max !== undefined && num > max) { onValueChange(num); return; }
    onValueChange(num);
  };
  return (
    <FormTextInput
      label={label}
      value={value === undefined ? '' : String(value)}
      onChangeText={handleChange}
      keyboardType="numeric"
      error={error}
      helperText={helperText}
      {...rest}
    />
  );
};
