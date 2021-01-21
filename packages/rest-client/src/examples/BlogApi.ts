import { Options, RequestError, RestClient } from '..';

interface ApiResponse<D> {
    data: D;
}

export interface BlogPost {
    id: string;
    title: string;
}

type BlogPostBody = Omit<BlogPost, 'id'>;

export class BlogApi extends RestClient {
    constructor(url = process.env.BLOG_API_URL, options?: Options) {
        super(url as string, {
            ...options,
            headers: {
                'x-api-key': process.env.BLOG_API_KEY as string,
                ...options?.headers,
            },
        });
    }

    async getPost(id: string): Promise<BlogPost | null> {
        try {
            const { data } = await this.get<ApiResponse<BlogPost>>(
                '/post/{id}',
                { params: { id } }
            );
            return data;
        } catch (error) {
            if (error instanceof RequestError && error.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async getPosts(query: { page: number }): Promise<BlogPost[]> {
        const { data } = await this.get<ApiResponse<BlogPost[]>>('/post', {
            query,
        });
        return data;
    }

    async createPost(post: BlogPostBody): Promise<BlogPost> {
        const { data } = await this.post<ApiResponse<BlogPost>>('/post', {
            body: { data: post },
        });
        return data;
    }

    async updatePost(id: string, post: BlogPostBody): Promise<BlogPost> {
        const { data } = await this.put<ApiResponse<BlogPost>>('/post/{id}', {
            params: { id },
            body: { data: post },
        });
        return data;
    }

    async deletePost(id: string): Promise<null> {
        return this.delete('/post/{id}', { params: { id } });
    }
}
