import { Tile38 } from '..';
import { FSetQuery } from './FSetQuery';

describe('FSetQuery', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should compile query', () => {
        const key = 'fleet';
        const id = 'truck1';
        const query = new FSetQuery(tile38, key, id, {
            speed: 10,
            weight: 100,
        });

        expect(query.compile()).toEqual([
            'FSET',
            [key, id, 'speed', 10, 'weight', 100],
        ]);
        expect(query.xx().compile()).toEqual([
            'FSET',
            [key, id, 'XX', 'speed', 10, 'weight', 100],
        ]);
        expect(query.xx(false).compile()).toEqual([
            'FSET',
            [key, id, 'speed', 10, 'weight', 100],
        ]);
    });
});
