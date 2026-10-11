import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, number } from './calculations.js';
const rows = [{share:'40',roi:'30'},{share:'30',roi:'20'},{share:'20',roi:'10'},{share:'10',roi:'5'}];
test('PRD example computes amounts, profit and weighted ROI', () => {
 const plan = calculate('100000',rows);
 assert.equal(plan.valid,true); assert.equal(plan.rows[0].amount,40000); assert.equal(plan.rows[0].profit,12000); assert.equal(plan.profit,20500); assert.equal(plan.roi,20.5);
});
test('incomplete allocation hides forecast', () => { const p=calculate('100000',rows.map(r=>({...r,share:'20'})));assert.equal(p.valid,false);assert.equal(p.profit,null);assert.equal(p.total,80); });
test('negative ROI and zero-share channels', () => { const p=calculate('100',[{share:'100',roi:'-50'},...Array.from({length:3},()=>({share:'0',roi:''}))]);assert.equal(p.valid,true);assert.equal(p.profit,-50); });
test('decimal allocation totals precisely 100', () => { const p=calculate('1000',[{share:'33,33',roi:'0'},{share:'33,33',roi:'0'},{share:'33,34',roi:'0'},{share:'0',roi:''}]);assert.equal(p.valid,true); });
test('invalid budget, shares and ROI rejected', () => { for(const budget of ['0','-1','','Infinity','1.234'])assert.ok(calculate(budget,rows).errors.budget);assert.ok(calculate('100',[{share:'101',roi:'-101'},...rows.slice(1)]).errors['share-0']);assert.ok(calculate('100',[{share:'40',roi:''},...rows.slice(1)]).errors['roi-0']);assert.ok(calculate('100',[{share:'40',roi:'-101'},...rows.slice(1)]).errors['roi-0']);assert.ok(calculate('100',[{share:'40',roi:'200'},...rows.slice(1)]).valid);assert.equal(number('1,25'),1.25); });
