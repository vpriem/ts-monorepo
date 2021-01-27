import { Tile38 } from '..';

describe('fset', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should fset', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(
            tile38.set('fleet', 'truck1').point(33.5123, -112.2693).exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        await expect(
            tile38.fset('fleet', 'truck1', { speed: 16 }).exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith('FSET', [
            'fleet',
            'truck1',
            'speed',
            16,
        ]);
    });
});
