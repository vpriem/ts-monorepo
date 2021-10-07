import { Response } from 'node-fetch';

export class RequestError extends Error {
    response: Response;

    statusCode: number;

    body?: object | null;

    constructor(message: string, response: Response, body?: object | null) {
        super(message);
        this.name = 'RequestError';
        this.response = response;
        this.statusCode = response.status;
        this.body = body;
    }
}
