'use client';

import React from 'react';
import StyleSheet from '@/app/styles/StyleSheet';

interface CustomButtonProps {
  labelText: string;
  onClick: () => void;
}

const styles = StyleSheet.create({
  baseButton: {
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '5px',
  },
  positive: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  negative: {
    backgroundColor: '#6c757d',
    color: 'white',
  },
});

export const PositiveButton: React.FC<CustomButtonProps> = ({ labelText, onClick }) => {
  return (
    <button style={{ ...styles.baseButton, ...styles.positive }} onClick={onClick}>
      {labelText}
    </button>
  );
};

export const NegativeButton: React.FC<CustomButtonProps> = ({ labelText, onClick }) => {
  return (
    <button style={{ ...styles.baseButton, ...styles.negative }} onClick={onClick}>
      {labelText}
    </button>
  );
};
