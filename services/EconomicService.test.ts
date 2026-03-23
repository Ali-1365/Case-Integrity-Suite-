import { test, describe } from 'node:test';
import assert from 'node:assert';
import { EconomicService } from './EconomicService';
import { DamageComponent } from '../lib/economic.types';

describe('EconomicService', () => {
  describe('calculateDamages', () => {
    test('should return 0 for an empty array of components', () => {
      const service = new EconomicService();
      const components: DamageComponent[] = [];
      const result = service.calculateDamages(components);
      assert.strictEqual(result, 0);
    });

    test('should calculate the sum of multiple damage components correctly', () => {
      const service = new EconomicService();
      const components: DamageComponent[] = [
        { id: '1', label: 'Sveda och värk', amount: 50000, description: 'Lidande' },
        { id: '2', label: 'Lyte och men', amount: 150000, description: 'Kvarstående men' },
        { id: '3', label: 'Inkomstförlust', amount: 25000, description: 'Förlorad lön' }
      ];
      const result = service.calculateDamages(components);
      assert.strictEqual(result, 225000); // 50000 + 150000 + 25000
    });

    test('should handle a single damage component', () => {
      const service = new EconomicService();
      const components: DamageComponent[] = [
        { id: '1', label: 'Sveda och värk', amount: 10000, description: 'Lidande' }
      ];
      const result = service.calculateDamages(components);
      assert.strictEqual(result, 10000);
    });

    test('should handle components with zero amount', () => {
      const service = new EconomicService();
      const components: DamageComponent[] = [
        { id: '1', label: 'Sveda och värk', amount: 5000, description: 'Lidande' },
        { id: '2', label: 'Inkomstförlust', amount: 0, description: 'Ingen förlorad lön' }
      ];
      const result = service.calculateDamages(components);
      assert.strictEqual(result, 5000);
    });

    test('should handle components with negative amounts (deductions)', () => {
      const service = new EconomicService();
      const components: DamageComponent[] = [
        { id: '1', label: 'Sveda och värk', amount: 50000, description: 'Lidande' },
        { id: '2', label: 'Jämkning', amount: -10000, description: 'Avdrag pga medvållande' }
      ];
      const result = service.calculateDamages(components);
      assert.strictEqual(result, 40000);
    });

    test('should handle large floating-point amounts', () => {
      const service = new EconomicService();
      const components: DamageComponent[] = [
        { id: '1', label: 'Inkomstförlust År 1', amount: 100000.55, description: '' },
        { id: '2', label: 'Inkomstförlust År 2', amount: 200000.45, description: '' }
      ];
      const result = service.calculateDamages(components);
      // To avoid floating point precision issues in test assertion, we can use a small tolerance or just test exact if safe
      // 100000.55 + 200000.45 = 300001
      assert.strictEqual(result, 300001);
    });
  });
});
