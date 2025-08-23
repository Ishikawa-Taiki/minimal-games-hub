import React from 'react';

export const HintIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8.5C12 7.12 12.67 5.85 13.8 5.25" />
    <path d="M8.5 12C7.12 12 5.85 12.67 5.25 13.8" />
    <path d="M12 15.5C12 16.88 11.33 18.15 10.2 18.75" />
    <path d="M15.5 12C16.88 12 18.15 11.33 18.75 10.2" />
    <path d="M9 17.65C7.57 16.5 6.5 14.28 6.5 12C6.5 8.96 8.96 6.5 12 6.5c.34 0 .68.03 1 .08" />
    <path d="M15 6.35C16.5 7.5 17.5 9.72 17.5 12c0 3.04-2.46 5.5-5.5 5.5-.34 0-.68-.03-1-.08" />
    <path d="m12 2 2.5 2.5" />
    <path d="m9.5 4.5 2.5-2.5" />
    <path d="M12 22l-2.5-2.5" />
    <path d="m14.5 19.5-2.5 2.5" />
    <path d="M2 12l2.5-2.5" />
    <path d="M4.5 14.5 2 12" />
    <path d="M22 12l-2.5 2.5" />
    <path d="m19.5 9.5 2.5-2.5" />
  </svg>
);
