import moment from "moment";
export function calculateCompletionTimeInHours(start_time: string, end_time: string): number {
    const start = moment(start_time); // Parse start time
    const end = moment(end_time); // Parse end time

    // Ensure start and end are valid dates
    if (!start.isValid() || !end.isValid()) {
        throw new Error("Invalid start_time or end_time");
    }

    // Calculate the difference in hours
    const totalHours = end.diff(start, "hours");

    return totalHours;
}