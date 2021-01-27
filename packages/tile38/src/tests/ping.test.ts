import { Command, Tile38 } from '..';

describe('ping', () => {
    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    it('should pong', async () => {
        const command = jest.spyOn(tile38, 'command');

        await expect(tile38.ping()).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
            ping: 'pong',
        });

        expect(command).toHaveBeenCalledWith(Command.PING);
    });
});
