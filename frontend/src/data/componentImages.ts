/**
 * Component Image URLs
 * Placeholder icon with links to product pages
 * Users can click the icon to view the product on KD Solar website
 */

// Generic component icon as base64 SVG
export const PLACEHOLDER_ICON = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjRjNGNEY2Ii8+CiAgPHBhdGggZD0iTTMyIDQwQzM2LjQxODMgNDAgNDAgMzYuNDE4MyA0MCAzMkM0MCAyNy41ODE3IDM2LjQxODMgMjQgMzIgMjRDMjcuNTgxNyAyNCAyNCAyNy41ODE3IDI0IDMyQzI0IDM2LjQxODMgMjcuNTgxNyA0MCAzMiA0MFoiIHN0cm9rZT0iIzk3QTBBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8cGF0aCBkPSJNMzIgMjhWMzYiIHN0cm9rZT0iIzk3QTBBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8cGF0aCBkPSJNMjggMzJIMzYiIHN0cm9rZT0iIzk3QTBBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";

/**
 * Component image mapping
 * Maps part number to actual product image URL from KD Solar CDN
 * Fallback to placeholder icon if image fails to load
 */
export const componentImages: Record<string, string> = {
  // These will be populated with actual Shopify CDN URLs
  // For now, components will use the placeholder with clickable product links
};
