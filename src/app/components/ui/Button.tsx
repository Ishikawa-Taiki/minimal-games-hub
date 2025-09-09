'use client';

import React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';

// A general-purpose button.
// For specific semantic actions like 'confirm' or 'cancel',
// prefer using PositiveButton or NegativeButton.
export const Button: React.FC<BaseButtonProps> = (props) => {
  // Default to 'secondary' variant if none is provided.
  const variant = props.variant || 'secondary';
  return <BaseButton {...props} variant={variant} />;
};
