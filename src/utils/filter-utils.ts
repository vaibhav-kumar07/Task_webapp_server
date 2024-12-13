import moment from 'moment';

export function parseFilters(filters: any) {
    const criteria: any = {};
    const parsedfilters: any = {};
    if (filters)
        for (const [key, value] of Object.entries(filters as any)) {
            try {
                parsedfilters[key] = typeof value === 'string' ? JSON.parse(value) : value; // Try to parse the value as JSON
            } catch (e) {
                parsedfilters[key] = value; // If parsing fails, keep the original value
            }
        }
    if (!filters) return criteria;

    for (const [field, condition] of Object.entries(parsedfilters) as [string, Record<string, any>][]) {
        const [operator, value] = Object.entries(condition)[0] || [];

        if (!operator || value === undefined) continue;

        switch (operator.toLowerCase()) {
            case '$eqi':
                criteria[field] = { $regex: new RegExp(`^${value}$`, 'i') };
                break;
            case '$between':
                parseBetweenFilter(criteria, field, value);
                break;
            case '$contains':
                criteria[field] = { $regex: new RegExp(value, 'i') };
                break;
            case '$in':
                criteria[field] = {
                    $in: Array.isArray(value)
                        ? value.map((v: string) => v.trim()) // If value is already an array
                        : value.split(',').map((v: string) => v.trim()), // If value is a comma-separated string
                };
                break;
            case '$lte':
            case '$gte':
                parseDateFilter(criteria, field, operator, value);
                break;
            case '$in_num':
                parseNumericFilter(criteria, field, value);
                break;
            case '$ne':
                criteria[field] = { $ne: value };
                break;
            case '$eq':
                criteria[field] = value === 'null' ? null : value;
                break;
        }
    }

    return criteria;
}
const parseBetweenFilter = (criteria: any, field: string, value: string) => {
    const values = value.split(',');
    if (values.length !== 2) return;
    if (value.startsWith('dt')) {
        const startDate = startOfDay(values[0].slice(2));
        const endDate = endOfDay(values[1]);
        criteria[field] = { $gte: startDate, $lte: endDate };
    } else {
        criteria[field] = { $gte: values[0], $lte: values[1] };
    }
};

const parseDateFilter = (criteria: any, field: string, operator: string, value: string) => {
    if (value.startsWith('dt')) {
        const date = operator === '$gte' ? startOfDay(value.slice(2)) : endOfDay(value.slice(2));
        criteria[field] = { [operator]: date };
    } else {
        criteria[field] = { [operator]: value };
    }
};

const parseNumericFilter = (criteria: any, field: string, value: string) => {
    const matchValues = value.split(',').map((v: any) => parseFloat(v));
    if (matchValues.some(isNaN)) {
        console.log('Invalid input: Non-numeric values found');
    } else {
        criteria[field] = matchValues.length > 1 ? { $in: matchValues } : matchValues[0];
    }
};

const endOfDay = (strDate: string, format: string = 'YYYY-MM-DD'): Date =>
    moment(strDate, format).endOf('day').toDate();

const startOfDay = (strDate: string, format: string = 'YYYY-MM-DD'): Date =>
    moment(strDate, format).startOf('day').toDate();
