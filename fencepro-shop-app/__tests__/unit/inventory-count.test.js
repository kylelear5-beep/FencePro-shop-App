// __tests__/unit/inventory-count.test.js
const request = require('supertest');

describe('Task Contract: Blind Count SOP', () => {
  let app;
  
  beforeEach(() => {
    app = require('../../server'); 
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('CONTRACT: GET /api/inventory/count-sheet strips out all on-hand quantities', async () => {
    const response = await request(app).get('/api/inventory/count-sheet');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // The Law: SKUs and Names are allowed, but quantities MUST be undefined
    const firstItem = response.body.items[0];
    expect(firstItem).toHaveProperty('sku');
    expect(firstItem).toHaveProperty('name');
    expect(firstItem.quantity).toBeUndefined(); 
  });

  it('CONTRACT: POST /api/inventory/reconcile sets absolute stock and calculates variance', async () => {
    // The crew counted exactly 48 posts in the yard
    const countPayload = { sku: '73003694', actualCount: 48, counterName: 'Big Bob' };
    
    const response = await request(app)
      .post('/api/inventory/reconcile')
      .send(countPayload);
      
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Count reconciled');
    // The server should tell us how far off we were AFTER the count is submitted
    expect(response.body).toHaveProperty('variance'); 
  });
});
