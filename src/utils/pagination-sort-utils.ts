export function applyPagination(pagination: { page?: number }) {
    let { page = 1 } = pagination || {};
    const pageSize = 10; // Page size is always 10
    if (page < 1) {
        page = 1;
    }
    const limit = pageSize; // Fixed limit to 10
    const skip = (page - 1) * limit;
    return { skip, limit };
}

export function applySort(sort: string) {
    const sortArray = sort.split(',');
    const sortObj: Record<string, number> = {};
    sortArray.forEach((sortItem) => {
        const [key, order] = sortItem.split(':');
        sortObj[key] = order === 'asc' ? 1 : -1;
    });
    return sortObj;
}
