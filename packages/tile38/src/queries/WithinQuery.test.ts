import { Tile38 } from '..';
import { WithinQuery } from './WithinQuery';

describe('WithinQuery', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should compile query', () => {
        const key = 'fleet';
        const query = new WithinQuery(tile38, key);

        expect(query.compile()).toEqual(['WITHIN', [key]]);

        expect(query.radius(1, 1, 1).compile()).toEqual([
            'WITHIN',
            [key, 'CIRCLE', 1, 1, 1],
        ]);
    });
});
