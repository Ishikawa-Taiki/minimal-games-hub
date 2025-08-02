"use client";

import { css } from '@emotion/react';

export default function Home() {
  return (
    <div css={css`
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f0f0;
      font-family: sans-serif;
    `}>
      <h1 css={css`
        color: #333;
        font-size: 2.5rem;
        text-align: center;
      `}>
        Hello, Emotion!
      </h1>
    </div>
  );
}
