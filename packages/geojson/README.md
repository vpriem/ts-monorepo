# geojson

GeoJSON TypeScript definitions exported as a package.

Exported from [@types/geojson](https://www.npmjs.com/package/@types/geojson).

## Install

```shell
yarn add @vpriem/geojson
```

## Usage

```typescript
import { Feature, Point } from '@vpriem/geojson';

const feature: Feature<Point> = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [13.404954, 52.520008],
    },
};
```

## License

[MIT](LICENSE)
