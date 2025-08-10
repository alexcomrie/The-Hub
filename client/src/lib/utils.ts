import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isBusinessOpen(operationHours: string): boolean {
  // Expected format: "8:00 AM - 9:30 PM"
  try {
    const [start, end] = operationHours.split('-').map(time => time.trim());
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    console.log('Current device time:', now.toLocaleTimeString());

    // Parse start time
    const [startTime, startPeriod] = start.split(' ');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startHour24 = startPeriod.toUpperCase() === 'PM' && startHour !== 12 
      ? startHour + 12 
      : startPeriod.toUpperCase() === 'AM' && startHour === 12 
      ? 0 
      : startHour;

    // Parse end time
    const [endTime, endPeriod] = end.split(' ');
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const endHour24 = endPeriod.toUpperCase() === 'PM' && endHour !== 12 
      ? endHour + 12 
      : endPeriod.toUpperCase() === 'AM' && endHour === 12 
      ? 0 
      : endHour;

    // Convert times to minutes since midnight
    let currentMinutesSinceMidnight = currentHour * 60 + currentMinute;
    const startMinutesSinceMidnight = startHour24 * 60 + startMinute;
    let endMinutesSinceMidnight = endHour24 * 60 + endMinute;

    // Handle cases where end time is before start time (spans midnight)
    if (endMinutesSinceMidnight < startMinutesSinceMidnight) {
      endMinutesSinceMidnight += 24 * 60; // Add 24 hours worth of minutes
      if (currentMinutesSinceMidnight < startMinutesSinceMidnight) {
        // If current time is after midnight but before closing
        currentMinutesSinceMidnight += 24 * 60;
      }
    }

    console.log('Time comparison (minutes since midnight):', {
      current: currentMinutesSinceMidnight,
      start: startMinutesSinceMidnight,
      end: endMinutesSinceMidnight,
      spansMidnight: endMinutesSinceMidnight > 24 * 60
    });

    return currentMinutesSinceMidnight >= startMinutesSinceMidnight && 
           currentMinutesSinceMidnight <= endMinutesSinceMidnight;
  } catch (error) {
    console.error('Error parsing operation hours:', error);
    return false;
  }
}
