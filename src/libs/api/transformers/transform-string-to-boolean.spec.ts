import { transformStringToBoolean } from '@libs/api/transformers/transform-string-to-boolean.transformer';

describe(transformStringToBoolean.name, () => {
  it('BooleanString 외의 값이 들어왔을 때', () => {
    expect(transformStringToBoolean({ value: '' })).toBe('');
  });

  it('string type의 1이 들어 왔을 때', () => {
    expect(transformStringToBoolean({ value: '1' })).toBe(true);
  });

  it('string type의 true가 들어 왔을 때', () => {
    expect(transformStringToBoolean({ value: 'true' })).toBe(true);
  });

  it('string type의 0이 들어 왔을 때', () => {
    expect(transformStringToBoolean({ value: '0' })).toBe(false);
  });

  it('string type의 false이 들어 왔을 때', () => {
    expect(transformStringToBoolean({ value: 'false' })).toBe(false);
  });
});
