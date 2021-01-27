import { Tile38 } from '..';

describe('set', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should set point', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(
            tile38.set('fleet', 'truck1').point(33.5123, -112.2693).exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith('SET', [
            'fleet',
            'truck1',
            'POINT',
            33.5123,
            -112.2693,
        ]);
    });

    it('should set object', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(
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
        });

        expect(command).toHaveBeenCalledWith('SET', [
            'fleet',
            'truck1',
            'OBJECT',
            '{"type":"Point","coordinates":[-112.2693,33.5123]}',
        ]);
    });

    it('should set hash', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(
            tile38.set('fleet', 'truck1').hash('9tbnt').exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith('SET', [
            'fleet',
            'truck1',
            'HASH',
            '9tbnt',
        ]);
    });
});
