import { Command, Tile38 } from '..';

describe('expire', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should expire', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(
            tile38.set('fleet', 'truck1').point(33.5123, -112.2693).exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        await expect(tile38.expire('fleet', 'truck1', 1)).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith(Command.EXPIRE, [
            'fleet',
            'truck1',
            1,
        ]);
    });
});
