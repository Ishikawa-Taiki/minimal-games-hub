'use client';

import React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';

// Exclude variant from the props that can be passed to NegativeButton
type NegativeButtonProps = Omit<BaseButtonProps, 'variant'>;

export const NegativeButton: React.FC<NegativeButtonProps> = (props) => {
  return <BaseButton variant="danger" {...props} />;
};
