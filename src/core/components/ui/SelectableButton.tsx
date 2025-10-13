'use client';

import React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';

// --- Checkbox Icon SVG ---
const CheckIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// --- Component Props ---
// BaseButtonPropsから、SelectableButtonで制御するプロパティを除外
type BaseProps = Omit<BaseButtonProps, 'onClick' | 'variant' | 'children'>;

export interface SelectableButtonProps extends BaseProps {
  children: React.ReactNode;
  isSelected: boolean;
  onStateChange: (isSelected: boolean) => void;
}

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem', // 8px
  },
  checkbox: {
    width: '1.25em', // 20px
    height: '1.25em', // 20px
    border: '2px solid currentColor',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
};

export const SelectableButton: React.FC<SelectableButtonProps> = ({
  isSelected,
  onStateChange,
  children,
  'data-testid': dataTestId,
  ...baseButtonProps
}) => {
  const handleClick = () => {
    onStateChange(!isSelected);
  };

  const variant = isSelected ? 'success' : 'ghost';

  // 'ghost' variant has a light border, 'success' has a colored border.
  // We can match the checkbox border to the button's text color for consistency.
  const checkboxColor = variant === 'ghost' ? '#374151' : '#ffffff';

  return (
    <BaseButton
      variant={variant}
      onClick={handleClick}
      data-testid={dataTestId}
      aria-pressed={isSelected}
      {...baseButtonProps}
    >
      <div style={styles.container}>
        <div style={{ ...styles.checkbox, color: checkboxColor }}>
          {isSelected && <CheckIcon />}
        </div>
        <span>{children}</span>
      </div>
    </BaseButton>
  );
};
