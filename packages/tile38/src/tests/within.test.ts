import { Tile38 } from '..';

describe('within', () => {
    const tile38 = new Tile38();
    const key = 'fleet';
    const id = 'truck1';
    const command = jest.spyOn(tile38, 'command');

    afterAll(() => tile38.quit());

    beforeAll(async () => {
        await tile38.flushDb();
        await tile38.set(key, id).point(33.5123, -112.2693).exec();
    });

    it('should return objects', async () => {
        await expect(
            tile38.within(key).radius(33.5123, -112.2693, 100).asObjects()
        ).resolves.toEqual({
            objects: [
                {
                    id,
                    object: {
                        type: 'Point',
                        coordinates: [-112.2693, 33.5123],
                    },
                },
            ],
            elapsed: expect.any(String) as String,
            count: 1,
            cursor: 0,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith('WITHIN', [
            key,
            'CIRCLE',
            33.5123,
            -112.2693,
            100,
        ]);
    });

    it('should return ids', async () => {
        await expect(
            tile38.within(key).radius(33.5123, -112.2693, 100).asIds()
        ).resolves.toEqual({
            ids: [id],
            elapsed: expect.any(String) as String,
            count: 1,
            cursor: 0,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith('WITHIN', [
            key,
            'IDS',
            'CIRCLE',
            33.5123,
            -112.2693,
            100,
        ]);
    });

    it('should return count', async () => {
        await expect(
            tile38.within(key).radius(33.5123, -112.2693, 100).asCount()
        ).resolves.toEqual({
            elapsed: expect.any(String) as String,
            count: 1,
            cursor: 0,
            ok: true,
        });

        expect(command).toHaveBeenCalledWith('WITHIN', [
            key,
            'COUNT',
            'CIRCLE',
            33.5123,
            -112.2693,
            100,
        ]);
    });
});
