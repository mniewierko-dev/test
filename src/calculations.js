export function number(value) {
  const text = String(value).trim().replace(',', '.');
  return /^-?\d+(\.\d{1,2})?$/.test(text) ? Number(text) : NaN;
}
export function calculate(budgetInput, rows) {
  const budget = number(budgetInput);
  const errors = {};
  if (!(budget > 0) || !Number.isFinite(budget)) errors.budget = 'Podaj budżet większy od zera, z maksymalnie 2 miejscami po przecinku.';
  const result = rows.map((row, i) => {
    const share = number(row.share);
    const roi = number(row.roi);
    if (!Number.isFinite(share) || share < 0 || share > 100) errors[`share-${i}`] = 'Podaj udział od 0 do 100%, z maksymalnie 2 miejscami po przecinku.';
    if (share > 0 && (!Number.isFinite(roi) || roi < -100)) errors[`roi-${i}`] = 'Podaj ROI co najmniej −100%, z maksymalnie 2 miejscami po przecinku.';
    const amount = budget * share / 100;
    return { share, roi, amount, profit: share === 0 ? 0 : amount * roi / 100 };
  });
  const total = result.reduce((sum, row) => sum + Math.round(row.share * 100), 0) / 100;
  const valid = Object.keys(errors).length === 0 && total === 100;
  const profit = valid ? result.reduce((sum, row) => sum + row.profit, 0) : null;
  return { budget, rows: result, errors, total, valid, profit, roi: valid ? profit / budget * 100 : null };
}
