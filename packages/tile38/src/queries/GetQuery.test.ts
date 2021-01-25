import { Tile38 } from '..';
import { GetQuery } from './GetQuery';

describe('GetQuery', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should compile query', () => {
        const key = 'fleet';
        const id = 'truck1';
        const query = new GetQuery(tile38, key, id);

        expect(query.compile()).toEqual(['GET', [key, id]]);
        expect(query.withFields().compile()).toEqual([
            'GET',
            [key, id, 'WITHFIELDS'],
        ]);
        expect(query.withFields(false).compile()).toEqual(['GET', [key, id]]);
    });
});
