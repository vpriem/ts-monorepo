import express from 'express';
import supertest from 'supertest';
import { apiKeyAuth } from '.';
import { loadApiKeys } from './utils';

describe('integration', () => {
    const apiKey1 = 'api-key-1';
    const apiKey2 = 'api-key-2';
    const apiKey3 = 'api-key-3';

    describe('from envs', () => {
        process.env.API_KEY_1 = apiKey1;
        process.env.API_KEY_2 = apiKey2;
        process.env.LA_API_KEY_3 = apiKey3;

        const regExp = /^API_KEY_/;

        const request = supertest(
            express()
                .use(apiKeyAuth(regExp))
                .get('/', (req, res) => res.send('OK'))
        );

        it('should load api keys from envs', () =>
            expect(loadApiKeys(regExp)).toEqual([apiKey1, apiKey2]));

        it('should return 401 with no api key', () =>
            request.get('/').expect(401));

        it('should return 401 with unknown api key', () =>
            request.get('/').set('x-api-key', apiKey3).expect(401));

        it('should return 200 for first api key', () =>
            request.get('/').set('x-api-key', apiKey1).expect(200, 'OK'));

        it('should return 200 for second api key', () =>
            request.get('/').set('x-api-key', apiKey2).expect(200, 'OK'));
    });

    describe('from static list', () => {
        const request = supertest(
            express()
                .use(apiKeyAuth([apiKey1, apiKey2]))
                .get('/', (req, res) => res.send('OK'))
        );

        it('should return 401 with no api key', () =>
            request.get('/').expect(401));

        it('should return 401 with unknown api key', () =>
            request.get('/').set('x-api-key', apiKey3).expect(401));

        it('should return 200 for first api key', () =>
            request.get('/').set('x-api-key', apiKey1).expect(200, 'OK'));

        it('should return 200 for second api key', () =>
            request.get('/').set('x-api-key', apiKey2).expect(200, 'OK'));
    });
});
