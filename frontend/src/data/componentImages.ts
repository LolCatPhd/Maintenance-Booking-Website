/**
 * Component Image URLs
 * Placeholder icon with links to product pages
 * Users can click the icon to view the product on KD Solar website
 */

// Generic component icon as base64 SVG
export const PLACEHOLDER_ICON = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjRjNGNEY2Ii8+CiAgPHBhdGggZD0iTTMyIDQwQzM2LjQxODMgNDAgNDAgMzYuNDE4MyA0MCAzMkM0MCAyNy41ODE3IDM2LjQxODMgMjQgMzIgMjRDMjcuNTgxNyAyNCAyNCAyNy41ODE3IDI0IDMyQzI0IDM2LjQxODMgMjcuNTgxNyA0MCAzMiA0MFoiIHN0cm9rZT0iIzk3QTBBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8cGF0aCBkPSJNMzIgMjhWMzYiIHN0cm9rZT0iIzk3QTBBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8cGF0aCBkPSJNMjggMzJIMzYiIHN0cm9rZT0iIzk3QTBBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";

/**
 * Component image mapping
 * Maps part number to local component image filenames
 * Images are stored in /public/images/components/
 * Extracted from KD Solar product matrix Excel file
 * CORRECTED: Images now properly mapped with anchor_row+1 offset
 */
export const componentImages: Record<string, string> = {
  "CLASS3-STITCH-14X22": "/images/components/image4.png",
  "CLASS3-TEK-SCREW-No.12x25mm-NS": "/images/components/image33.png",
  "EPDM1.5-PSA-1190X50": "/images/components/image31.png",
  "EPDM1.5-PSA-1730x50": "/images/components/image46.png",
  "KDS-AF13-25ADJ-LS-2PP-1135": "/images/components/image34.png",
  "KDS-AF13-25ADJ-PORT-BNW": "/images/components/image49.png",
  "KDS-AF15FX-GUSS-LS-BNW": "/images/components/image36.png",
  "KDS-AF15FX-GUSS-PORT-BNW": "/images/components/image48.png",
  "KDS-AF15FX-HW-LS-BNW": "/images/components/image45.png",
  "KDS-AF15FX-HW-PORT-BNW": "/images/components/image44.png",
  "KDS-BALLAST-12": "/images/components/image29.png",
  "KDS-BALLAST-HOLD": "/images/components/image28.png",
  "KDS-BNWT-DBL": "/images/components/image56.png",
  "KDS-CL120-15TILT-LS-F-AC": "/images/components/image70.png",
  "KDS-CL120-15TILT-LS-F-AL": "/images/components/image72.png",
  "KDS-CL120-15TILT-LS-R-AC": "/images/components/image69.png",
  "KDS-CL120-15TILT-LS-R-AL": "/images/components/image71.png",
  "KDS-CL120-15TILT-P-F-AC": "/images/components/image74.png",
  "KDS-CL120-15TILT-P-F-AL": "/images/components/image76.png",
  "KDS-CL120-15TILT-P-R-AC": "/images/components/image73.png",
  "KDS-CL120-15TILT-P-R-AL": "/images/components/image75.png",
  "KDS-CL120-PCSLOT": "/images/components/image77.png",
  "KDS-CL78-PCSLOT": "/images/components/image11.png",
  "KDS-CL78-PCSLOT-500NRP": "/images/components/image12.png",
  "KDS-COR120-15TILT-LS-F-AC": "/images/components/image60.png",
  "KDS-COR120-15TILT-LS-R-AC": "/images/components/image59.png",
  "KDS-COR120-15TILT-P-F-AC": "/images/components/image64.png",
  "KDS-COR120-15TILT-P-R-AC": "/images/components/image63.png",
  "KDS-COR120-PCSLOT": "/images/components/image67.png",
  "KDS-COR200-15TILT-LS-F-AL": "/images/components/image62.png",
  "KDS-COR200-15TILT-LS-R-AL": "/images/components/image61.png",
  "KDS-COR200-15TILT-P-F-AL": "/images/components/image66.png",
  "KDS-COR200-15TILT-P-R-AL": "/images/components/image65.png",
  "KDS-COR200-PCSLOT": "/images/components/image68.png",
  "KDS-COR78-PCSLOT": "/images/components/image10.png",
  "KDS-DD120-PCSLOT": "/images/components/image13.png",
  "KDS-DS700-120-PCSLOT": "/images/components/image80.png",
  "KDS-DS700-78-PCSLOT": "/images/components/image18.png",
  "KDS-EARTH-BAR-MP": "/images/components/image3.png",
  "KDS-END CLAMP-A": "/images/components/image32.png",
  "KDS-END CLAMP-P": "/images/components/image2.png",
  "KDS-GUSSET-P-F-BH": "/images/components/image35.png",
  "KDS-HANG-BOLT-BRACKET-P": "/images/components/image16.png",
  "KDS-HANG-BOLT-M10X200W": "/images/components/image17.png",
  "KDS-IBR120-15TILT-LS-F-AC": "/images/components/image26.png",
  "KDS-IBR120-15TILT-LS-R-AC": "/images/components/image27.png",
  "KDS-IBR120-15TILT-P-F-AC": "/images/components/image53.png",
  "KDS-IBR120-15TILT-P-R-AC": "/images/components/image52.png",
  "KDS-IBR120-PCSLOT": "/images/components/image57.png",
  "KDS-IBR250-2F-15TILT-LS-F-AL": "/images/components/image51.png",
  "KDS-IBR250-2F-15TILT-LS-R-AL": "/images/components/image50.png",
  "KDS-IBR250-2F-15TILT-P-F-AL": "/images/components/image55.png",
  "KDS-IBR250-2F-15TILT-P-R-AL": "/images/components/image54.png",
  "KDS-IBR250-ADJ2F-PCSLOT": "/images/components/image5.png",
  "KDS-IBR78-PCSLOT": "/images/components/image9.png",
  "KDS-MC35-40P": "/images/components/image1.png",
  "KDS-NOVOT120-PCSLOT": "/images/components/image79.png",
  "KDS-NOVOT78-PCSLOT": "/images/components/image14.png",
  "KDS-NOVOT78-PCSLOT-PEN": "/images/components/image15.png",
  "KDS-PC30": "/images/components/image8.png",
  "KDS-RAIL-LT": "/images/components/image6.png",
  "KDS-RWD-BH-LS": "/images/components/image30.png",
  "KDS-RWD-BH-PORT": "/images/components/image47.png",
  "KDS-SAFE-FIX300": "/images/components/image43.png",
  "KDS-SLATE/HARVEY-1-KIT": "/images/components/image19.png",
  "KDS-SS120-4.52H-PCSLOT": "/images/components/image20.png",
  "KDS-TILE-P": "/images/components/image21.png",
  "KDS-U-JOIN": "/images/components/image7.png",
  "SS304-NUT-M12": "/images/components/image41.png",
  "SS304-THREAD-M12": "/images/components/image42.png",
  "SS304-WASHER-FLAT-M12": "/images/components/image40.png",
  "ZP-SCREW-TPS-6.35X60": "/images/components/image22.png",
};
