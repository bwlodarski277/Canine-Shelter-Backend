'use strict';

// This passes because 1 === 1
it('Testing to see if Jest works', () => expect(1).toBe(1));

// This test fails because 1 !== 2
xit('Testing to see if Jest works 2', () => expect(1).toBe(2));
