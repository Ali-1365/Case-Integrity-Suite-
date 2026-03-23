import test from 'node:test';
import assert from 'node:assert/strict';
import { generateIntegrityStamp } from '../lib/hashUtils';

test('hashUtils - generateIntegrityStamp', async (t) => {
  await t.test('should return a string in the correct format', () => {
    const data = { dummy: 'data' };
    const stamp = generateIntegrityStamp(data);

    // Expected format: CIS-INT-<TIMESTAMP>-<8_HEX_CHARS>
    // e.g., CIS-INT-20231024T153000000Z-A1B2C3D4
    const formatRegex = /^CIS-INT-\d{4}\d{2}\d{2}T\d{2}\d{2}\d{2}\d{3}Z-[A-F0-9]{8}$/;

    assert.match(stamp, formatRegex, `Stamp "${stamp}" does not match the expected format.`);
  });

  await t.test('should generate unique stamps (no collisions in 1000 calls)', () => {
    const iterations = 1000;
    const generatedStamps = new Set<string>();

    for (let i = 0; i < iterations; i++) {
      const stamp = generateIntegrityStamp({ iteration: i });
      generatedStamps.add(stamp);
    }

    assert.strictEqual(generatedStamps.size, iterations, `Expected ${iterations} unique stamps, but got ${generatedStamps.size}`);
  });
});
