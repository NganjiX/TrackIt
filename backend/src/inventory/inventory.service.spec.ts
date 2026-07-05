import { isLowStock } from './inventory.utils';

describe('isLowStock', () => {
  it('returns true when stock is at threshold', () => {
    expect(isLowStock(20, 20)).toBe(true);
  });

  it('returns true when stock is below threshold', () => {
    expect(isLowStock(5, 20)).toBe(true);
  });

  it('returns false when stock is above threshold', () => {
    expect(isLowStock(21, 20)).toBe(false);
  });
});
