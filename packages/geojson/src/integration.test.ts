import { Feature, Point } from '.';

describe('integration', () => {
    it('should define Feature/Point', () => {
        const feature: Feature<Point, { name: string }> = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13.404954, 52.520008],
            },
            properties: {
                name: 'Berlin',
            },
        };

        expect(feature).toBeDefined();
    });
});
