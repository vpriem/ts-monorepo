import { Command, Tile38 } from '..';

describe('del', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should del', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(tile38.del('fleet', 'truck1')).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith(Command.DEL, ['fleet', 'truck1']);
    });
});
