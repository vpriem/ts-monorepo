import { Tile38 } from '..';

describe('pdel', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should pdel', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(tile38.pdel('fleet', 'truck*')).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith('PDEL', ['fleet', 'truck*']);
    });
});
