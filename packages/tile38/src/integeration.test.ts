import {
    Tile38,
    Tile38Error,
    Tile38IdNotFoundError,
    Tile38KeyNotFoundError,
} from '.';

describe('integration', () => {
    process.env.TILE38_URI = 'redis://localhost:9851/';

    const tile38 = new Tile38();

    afterAll(() => tile38.quit());

    describe('error', () => {
        it.skip('should throw an error', () =>
            expect(
                tile38.set('fleet', 'truck1').point(-1500000, 1500000).exec()
            ).rejects.toBeInstanceOf(Tile38Error));

        it('should throw key not found', () =>
            expect(tile38.get('asd', 'truck1').exec()).rejects.toBeInstanceOf(
                Tile38KeyNotFoundError
            ));

        it('should throw id not found', async () => {
            await tile38
                .set('fleet', 'truck1')
                .point(33.5123, -112.2693)
                .exec();

            await expect(
                tile38.get('fleet', 'truck666').exec()
            ).rejects.toBeInstanceOf(Tile38IdNotFoundError);
        });
    });

    describe('.get', () => {
        beforeAll(() =>
            expect(
                tile38
                    .set('fleet', 'truck1')
                    .point(33.5123, -112.2693)
                    .field('speed', 900)
                    .ex(60)
                    .exec()
            ).resolves.toEqual({
                elapsed: expect.any(String) as String,
                ok: true,
            })
        );

        it('should get with explicitly no fields', () =>
            expect(
                tile38
                    .get('fleet', 'truck1')
                    .withFields()
                    .withFields(false)
                    .toObject()
            ).resolves.toEqual({
                object: {
                    type: 'Point',
                    coordinates: [-112.2693, 33.5123],
                },
                elapsed: expect.any(String) as String,
                ok: true,
            }));

        it('should return object', () =>
            expect(tile38.get('fleet', 'truck1').toObject()).resolves.toEqual({
                object: {
                    type: 'Point',
                    coordinates: [-112.2693, 33.5123],
                },
                elapsed: expect.any(String) as String,
                ok: true,
            }));

        it('should return object with fields', () =>
            expect(
                tile38.get('fleet', 'truck1').withFields().toObject()
            ).resolves.toEqual({
                object: {
                    type: 'Point',
                    coordinates: [-112.2693, 33.5123],
                },
                fields: {
                    speed: 900,
                },
                elapsed: expect.any(String) as String,
                ok: true,
            }));

        it('should return point', () =>
            expect(tile38.get('fleet', 'truck1').toPoint()).resolves.toEqual({
                point: {
                    lat: 33.5123,
                    lon: -112.2693,
                },
                elapsed: expect.any(String) as String,
                ok: true,
            }));

        it('should return point with fields', () =>
            expect(
                tile38.get('fleet', 'truck1').withFields().toPoint()
            ).resolves.toEqual({
                point: {
                    lat: 33.5123,
                    lon: -112.2693,
                },
                fields: {
                    speed: 900,
                },
                elapsed: expect.any(String) as String,
                ok: true,
            }));

        it('should return hash', () =>
            expect(tile38.get('fleet', 'truck1').toHash(5)).resolves.toEqual({
                hash: '9tbnt',
                elapsed: expect.any(String) as String,
                ok: true,
            }));

        it('should return hash with fields', () =>
            expect(
                tile38.get('fleet', 'truck1').withFields().toHash(5)
            ).resolves.toEqual({
                hash: '9tbnt',
                fields: {
                    speed: 900,
                },
                elapsed: expect.any(String) as String,
                ok: true,
            }));
    });
});
