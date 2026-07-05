describe('HistoryService percentChange logic', () => {
  const percentChange = (previous: number, current: number): number => {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  it('calculates positive growth', () => {
    expect(percentChange(100, 120)).toBe(20);
  });

  it('returns 100 when starting from zero', () => {
    expect(percentChange(0, 50)).toBe(100);
  });

  it('returns 0 when both are zero', () => {
    expect(percentChange(0, 0)).toBe(0);
  });
});
