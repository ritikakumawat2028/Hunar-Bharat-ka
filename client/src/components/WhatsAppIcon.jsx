import React from 'react';

/**
 * Clean, standard WhatsApp SVG Icon
 * Styled cleanly to match Black-and-White theme or styled with green when requested
 */
export const WhatsAppIcon = ({ size = 16, color = "currentColor", style = {}, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const WhatsAppSolidIcon = ({ size = 16, color = "#25D366", style = {}, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.62L5.07 16.3C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.69 12.05 3.69C14.25 3.69 16.31 4.55 17.87 6.11C19.42 7.67 20.28 9.73 20.28 11.93C20.27 16.47 16.59 20.15 12.05 20.15ZM16.57 14.36C16.32 14.23 15.1 13.63 14.88 13.55C14.65 13.47 14.49 13.43 14.32 13.68C14.15 13.93 13.68 14.49 13.54 14.65C13.4 14.81 13.26 14.83 13.01 14.71C12.76 14.58 11.97 14.32 11.03 13.48C10.29 12.82 9.8 12.01 9.66 11.76C9.52 11.51 9.65 11.38 9.77 11.25C9.88 11.14 10.02 10.96 10.15 10.81C10.27 10.66 10.31 10.55 10.39 10.38C10.47 10.21 10.43 10.07 10.37 9.95C10.31 9.83 9.81 8.6 9.6 8.1C9.4 7.61 9.19 7.68 9.04 7.67H8.56C8.39 7.67 8.12 7.73 7.89 7.98C7.66 8.23 7.02 8.83 7.02 10.05C7.02 11.27 7.91 12.44 8.03 12.61C8.16 12.77 9.77 15.26 12.24 16.33C12.83 16.58 13.28 16.73 13.64 16.85C14.23 17.03 14.77 17.01 15.2 16.94C15.68 16.87 16.67 16.34 16.88 15.76C17.08 15.18 17.08 14.68 17.02 14.58C16.96 14.48 16.82 14.48 16.57 14.36Z" />
  </svg>
);

export default WhatsAppSolidIcon;
