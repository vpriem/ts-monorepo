import { Leader, Tile38 } from '..';

describe('follower', () => {
    const tile38 = new Tile38(undefined, process.env.TILE38_URI);

    afterAll(() => tile38.quit());

    beforeAll(() =>
        expect(
            tile38.set('fleet', 'truck1').point(33.5123, -112.2693).exec()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            ok: true,
        })
    );

    it('should get from leader or follower', async () => {
        const get = jest.spyOn(Leader.prototype, 'get');
        const response = {
            object: {
                type: 'Point',
                coordinates: [-112.2693, 33.5123],
            },
            elapsed: expect.any(String) as String,
            ok: true,
        };

        await expect(tile38.get('fleet', 'truck1').asObject()).resolves.toEqual(
            response
        );
        expect(get).not.toHaveBeenCalled();

        await expect(
            tile38.get('fleet', 'truck1', true).asObject()
        ).resolves.toEqual(response);
        expect(get).toHaveBeenCalledWith('fleet', 'truck1');
    });
});
