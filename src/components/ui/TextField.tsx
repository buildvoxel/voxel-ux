import React, { lazy, Suspense } from 'react';
import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { useThemeStore } from '@/store/themeStore';

// Lazy load shadcn Input
const ShadcnInput = lazy(() =>
  import('./shadcn/Input').then((mod) => ({ default: mod.Input }))
);

export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  type?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  minRows?: number;
  InputProps?: MuiTextFieldProps['InputProps'];
  inputProps?: MuiTextFieldProps['inputProps'];
  sx?: MuiTextFieldProps['sx'];
  className?: string;
  name?: string;
  id?: string;
  variant?: 'outlined' | 'filled' | 'standard';
}

export function TextField({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  type = 'text',
  size = 'medium',
  fullWidth,
  error,
  helperText,
  disabled,
  required,
  autoFocus,
  multiline,
  rows,
  maxRows,
  minRows,
  InputProps,
  inputProps,
  sx,
  className,
  name,
  id,
  variant = 'outlined',
}: TextFieldProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    // For multiline, we need a textarea
    if (multiline) {
      return (
        <Suspense
          fallback={
            <MuiTextField
              label={label}
              placeholder={placeholder}
              value={value}
              defaultValue={defaultValue}
              onChange={onChange}
              onBlur={onBlur}
              onFocus={onFocus}
              onKeyDown={onKeyDown}
              type={type}
              size={size}
              fullWidth={fullWidth}
              error={error}
              helperText={helperText}
              disabled={disabled}
              required={required}
              autoFocus={autoFocus}
              multiline={multiline}
              rows={rows}
              maxRows={maxRows}
              minRows={minRows}
              InputProps={InputProps}
              inputProps={inputProps}
              sx={sx}
              className={className}
              name={name}
              id={id}
              variant={variant}
            />
          }
        >
          <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
            {label && (
              <label className="text-sm font-medium text-text-primary">
                {label}
                {required && <span className="text-error ml-0.5">*</span>}
              </label>
            )}
            <textarea
              placeholder={placeholder}
              value={value as string}
              defaultValue={defaultValue as string}
              onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
              onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
              onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
              onKeyDown={onKeyDown as unknown as React.KeyboardEventHandler<HTMLTextAreaElement>}
              disabled={disabled}
              required={required}
              autoFocus={autoFocus}
              rows={rows || minRows || 3}
              name={name}
              id={id}
              className={`flex w-full rounded-md border-2 bg-surface px-3 py-2 text-sm text-text-primary transition-all duration-150
                border-border placeholder:text-text-tertiary
                focus:outline-none focus:border-indigo focus:ring-4 focus:ring-indigo/10
                disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background
                ${error ? 'border-error focus:border-error focus:ring-error/10' : ''}
                resize-none`}
            />
            {helperText && (
              <p className={`text-xs ${error ? 'text-error' : 'text-text-tertiary'}`}>
                {helperText}
              </p>
            )}
          </div>
        </Suspense>
      );
    }

    return (
      <Suspense
        fallback={
          <MuiTextField
            label={label}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            type={type}
            size={size}
            fullWidth={fullWidth}
            error={error}
            helperText={helperText}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            InputProps={InputProps}
            inputProps={inputProps}
            sx={sx}
            className={className}
            name={name}
            id={id}
            variant={variant}
          />
        }
      >
        <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
          {label && (
            <label className="text-sm font-medium text-text-primary">
              {label}
              {required && <span className="text-error ml-0.5">*</span>}
            </label>
          )}
          <div className="relative flex items-center">
            {InputProps?.startAdornment && (
              <div className="absolute left-3 flex items-center text-text-tertiary">
                {InputProps.startAdornment}
              </div>
            )}
            <ShadcnInput
              placeholder={placeholder}
              value={value as string}
              defaultValue={defaultValue as string}
              onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
              onBlur={onBlur as React.FocusEventHandler<HTMLInputElement>}
              onFocus={onFocus as React.FocusEventHandler<HTMLInputElement>}
              onKeyDown={onKeyDown as unknown as React.KeyboardEventHandler<HTMLInputElement>}
              type={type}
              disabled={disabled}
              error={error}
              helperText={typeof helperText === 'string' ? helperText : undefined}
              className={`${fullWidth ? 'w-full' : ''} ${InputProps?.startAdornment ? 'pl-10' : ''} ${InputProps?.endAdornment ? 'pr-10' : ''}`}
              autoFocus={autoFocus}
              name={name}
              id={id}
            />
            {InputProps?.endAdornment && (
              <div className="absolute right-3 flex items-center text-text-tertiary">
                {InputProps.endAdornment}
              </div>
            )}
          </div>
        </div>
      </Suspense>
    );
  }

  return (
    <MuiTextField
      label={label}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      type={type}
      size={size}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      disabled={disabled}
      required={required}
      autoFocus={autoFocus}
      multiline={multiline}
      rows={rows}
      maxRows={maxRows}
      minRows={minRows}
      InputProps={InputProps}
      inputProps={inputProps}
      sx={sx}
      className={className}
      name={name}
      id={id}
      variant={variant}
    />
  );
}

export default TextField;
