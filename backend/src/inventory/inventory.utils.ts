/**
 * Determines whether a product is low on stock (INV-03).
 */
export function isLowStock(stockQuantity: number, lowStockThreshold: number): boolean {
  return stockQuantity <= lowStockThreshold;
}
