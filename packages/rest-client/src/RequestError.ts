import { Response } from 'node-fetch';

export class RequestError extends Error {
    response: Response;

    statusCode: number;

    constructor(message: string, response: Response) {
        super(message);
        this.name = 'RequestError';
        this.response = response;
        this.statusCode = response.status;
    }
}
