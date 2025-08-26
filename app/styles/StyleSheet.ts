import React from 'react';

type Style = React.CSSProperties;

type NamedStyles<T> = { [P in keyof T]: Style };

class StyleSheet {
  public static create<T extends NamedStyles<T> | NamedStyles<Record<string, Style>>>(
    styles: T | NamedStyles<T>
  ): T {
    return styles;
  }
}

export default StyleSheet;
