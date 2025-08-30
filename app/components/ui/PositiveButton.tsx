'use client';

import React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';

// Exclude variant from the props that can be passed to PositiveButton
type PositiveButtonProps = Omit<BaseButtonProps, 'variant'>;

export const PositiveButton: React.FC<PositiveButtonProps> = (props) => {
  return <BaseButton variant="primary" {...props} />;
};
