import React from 'react';

type Style = React.CSSProperties;

class StyleSheet {
  public static create<T extends Record<string, Style>>(styles: T): T {
    return styles;
  }
}

export default StyleSheet;
