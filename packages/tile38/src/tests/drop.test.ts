import { Tile38 } from '..';

describe('drop', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should drop', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(tile38.drop('fleet')).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith('DROP', ['fleet']);
    });
});
