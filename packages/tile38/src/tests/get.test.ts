import { Tile38 } from '..';

describe('get', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    beforeAll(() =>
        expect(
            tile38.set('fleet', 'truck1').point(33.5123, -112.2693).exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        })
    );

    it('should return object', () =>
        expect(tile38.get('fleet', 'truck1').asObject()).resolves.toEqual({
            object: {
                type: 'Point',
                coordinates: [-112.2693, 33.5123],
            },
            elapsed: expect.any(String) as String,
            ok: true,
        }));

    it('should return point', () =>
        expect(tile38.get('fleet', 'truck1').asPoint()).resolves.toEqual({
            point: {
                lat: 33.5123,
                lon: -112.2693,
            },
            elapsed: expect.any(String) as String,
            ok: true,
        }));

    it('should return hash', () =>
        expect(tile38.get('fleet', 'truck1').asHash(5)).resolves.toEqual({
            hash: '9tbnt',
            elapsed: expect.any(String) as String,
            ok: true,
        }));
});
