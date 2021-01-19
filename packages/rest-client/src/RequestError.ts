import { Response } from 'node-fetch';

export class RequestError extends Error {
    response: Response;

    status: number;

    constructor(message: string, response: Response) {
        super(message);
        this.name = 'RequestError';
        this.response = response;
        this.status = response.status;
    }
}
