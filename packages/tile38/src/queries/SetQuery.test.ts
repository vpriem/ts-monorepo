import { Tile38 } from '..';
import { SetQuery } from './SetQuery';

describe('SetQuery', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should compile query', () => {
        const key = 'fleet';
        const id = 'truck1';
        const query = new SetQuery(tile38, key, id);

        expect(query.compile()).toEqual(['SET', [key, id]]);
        expect(query.fields({ speed: 10, weight: 100 }).compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 10, 'FIELD', 'weight', 100],
        ]);
        expect(query.field('speed', 1).compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1],
        ]);
        expect(query.ex(60).compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1, 'EX', 60],
        ]);
        expect(query.xx().compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1, 'EX', 60, 'XX'],
        ]);
        expect(query.xx(false).compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1, 'EX', 60],
        ]);
        expect(query.nx().compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1, 'EX', 60, 'NX'],
        ]);
        expect(query.nx(false).compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1, 'EX', 60],
        ]);
        expect(query.point(1.1, 1.2).compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1, 'EX', 60, 'POINT', 1.1, 1.2],
        ]);
        expect(query.object({ foo: 'bar' }).compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1, 'EX', 60, 'OBJECT', '{"foo":"bar"}'],
        ]);
        expect(query.hash('9tbnt').compile()).toEqual([
            'SET',
            [key, id, 'FIELD', 'speed', 1, 'EX', 60, 'HASH', '9tbnt'],
        ]);
        expect(query.fields().ex().compile()).toEqual([
            'SET',
            [key, id, 'HASH', '9tbnt'],
        ]);
    });
});
