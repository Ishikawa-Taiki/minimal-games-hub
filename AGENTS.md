# AI Agent Development Rules

This document provides a set of rules that AI agents must follow when working in this repository. These rules are considered the primary source of truth and override any conflicting information in other documentation.

## 1. Style and CSS

**DO NOT use inline styles with object literals.**

- **Incorrect:** `<div style={{ color: 'red', fontSize: '12px' }}>...</div>`
- **Reason:** This is difficult to maintain and violates our styling conventions.

**DO use the `styles` object pattern.** Define your styles in a `styles` object within the component file and reference them. This is the approved method for component-level styling.

- **Correct:**
  ```javascript
  const styles = {
    container: {
      padding: '10px',
    },
    title: {
      fontSize: '16px',
    }
  };

  function MyComponent() {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Hello</h1>
      </div>
    );
  }
  ```

## 2. Component Naming

- All React component file names and function names must use **PascalCase**.
- **Correct:** `MyComponent.tsx`
- **Incorrect:** `myComponent.tsx`, `my-component.tsx`

## 3. State Management

- All application state must be managed using **Recoil.js**.
- Use the `useRecoilState` or `useRecoilValue` hooks for accessing state. Do not use React's built-in `useState` for global or shared state.

## 4. Pre-Submission Check

Before submitting any changes, you **must** run the rule checker to ensure compliance.

```bash
npm run test:rules
```

This command will help you verify that you have followed the rules above. Address any reported issues before requesting a code review.
