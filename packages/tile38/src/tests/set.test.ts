import { Tile38 } from '..';

describe('set', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should set point', () =>
        expect(
            tile38.set('fleet', 'truck1').point(33.5123, -112.2693).exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        }));

    it('should set object', () =>
        expect(
            tile38
                .set('fleet', 'truck1')
                .object({
                    type: 'Point',
                    coordinates: [-112.2693, 33.5123],
                })
                .exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        }));

    it('should set hash', () =>
        expect(
            tile38.set('fleet', 'truck1').hash('9tbnt').exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        }));
});
