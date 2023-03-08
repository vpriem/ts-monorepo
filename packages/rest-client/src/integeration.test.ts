import nock from 'nock';
import { RequestError, RestClient } from '.';
import { BlogPost, BlogApi } from './examples';

describe('integration', () => {
    describe('RestClient', () => {
        const url = 'http://my.api';
        const client = new RestClient(url);

        it('should request with no options', async () => {
            const scope = nock(url, {
                reqheaders: {
                    Accept: 'application/json',
                },
            })
                .get('/resource')
                .reply(200, {});

            await expect(client.request('/resource')).resolves.toEqual({});

            expect(scope.isDone()).toBeTruthy();
        });
    });

    describe('BlogApi', () => {
        process.env.BLOG_API_URL = 'http://blog.api';
        process.env.BLOG_API_KEY = 'blog-api-key';

        const blogApi = new BlogApi();

        const post: BlogPost = {
            id: '859e3470-bcaa-499d-948f-0216e168e633',
            title: 'Lorem Ipsum',
        };

        it('should return a post', async () => {
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                },
            })
                .get(`/post/${post.id}`)
                .reply(
                    200,
                    { data: post },
                    { 'Content-Type': 'application/json; charset=utf-8' }
                );

            await expect(blogApi.getPost(post.id)).resolves.toEqual(post);

            expect(scope.isDone()).toBeTruthy();
        });

        it.each([
            'application/geo+json; charset=utf-8',
            'application/vnd.geo+json; charset=utf-8',
        ])('should return a post geo+json', async (contentType: string) => {
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                },
            })
                .get(`/post/${post.id}`)
                .reply(200, { data: post }, { 'content-type': contentType });

            await expect(blogApi.getPost(post.id)).resolves.toEqual(post);

            expect(scope.isDone()).toBeTruthy();
        });

        it('should return null on not found', async () => {
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                },
            })
                .get(`/post/${post.id}`)
                .reply(404, {});

            await expect(blogApi.getPost(post.id)).resolves.toBeNull();

            expect(scope.isDone()).toBeTruthy();
        });

        it('should return all posts', async () => {
            const data = [post, post, post];
            const page = 1;
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                },
            })
                .get('/post')
                .query({ page })
                .reply(200, { data });

            await expect(blogApi.getPosts({ page })).resolves.toEqual(data);

            expect(scope.isDone()).toBeTruthy();
        });

        it('should create a post', async () => {
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
                .post('/post', { data: { title: post.title } })
                .reply(200, { data: post });

            await expect(
                blogApi.createPost({ title: post.title })
            ).resolves.toEqual(post);

            expect(scope.isDone()).toBeTruthy();
        });

        it('should update a post', async () => {
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
                .put(`/post/${post.id}`, { data: { title: post.title } })
                .reply(200, { data: post });

            await expect(
                blogApi.updatePost(post.id, { title: post.title })
            ).resolves.toEqual(post);

            expect(scope.isDone()).toBeTruthy();
        });

        it('should throw an error with decoded body', async () => {
            const errors = [{ error: 'title is missing' }];
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
                .put(`/post/${post.id}`)
                .reply(400, { errors });

            await expect(
                blogApi.updatePost(post.id, { title: post.title })
            ).rejects.toMatchObject({
                name: 'RequestError',
                response: expect.any(Object) as object,
                statusCode: 400,
                body: { errors },
            });

            expect(scope.isDone()).toBeTruthy();
        });

        it('should delete a post', async () => {
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                },
            })
                .delete(`/post/${post.id}`)
                .reply(200);

            await expect(blogApi.deletePost(post.id)).resolves.toBeNull();

            expect(scope.isDone()).toBeTruthy();
        });

        it('should still throw an error on delete', async () => {
            const scope = nock(process.env.BLOG_API_URL as string, {
                reqheaders: {
                    'x-api-key': process.env.BLOG_API_KEY as string,
                    Accept: 'application/json',
                },
            })
                .delete(`/post/${post.id}`)
                .reply(500);

            await expect(blogApi.deletePost(post.id)).rejects.toBeInstanceOf(
                RequestError
            );

            expect(scope.isDone()).toBeTruthy();
        });
    });
});
