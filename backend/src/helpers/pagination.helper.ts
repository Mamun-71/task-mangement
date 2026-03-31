import { SelectQueryBuilder, ObjectLiteral } from "typeorm";

export interface PaginateOptions {
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    currentPage: number;
    perPage: number;
    totalPages: number;
}

export async function paginate<T extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<T>, options: PaginateOptions = {}): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
        items,
        total,
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
    };
}
