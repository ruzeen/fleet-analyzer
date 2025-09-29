// Parse date strings
function parseDate(dateStr) {
  // Function to Define YEAR of pickup date for Bookings
  const correctBookingDate = (bookingDate) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const bookingDay = bookingDate.split("/")[0];
    const bookingMonth = new Date(Date.parse(bookingDate)).getMonth() + 1;

    if (bookingMonth < currentDate.getMonth() + 1) {
      return `${bookingMonth}/${bookingDay}/${currentYear + 1}`;
    }

    return `${bookingMonth}/${bookingDay}/${currentYear}`;
  };

  // Handle different date formats
  if (dateStr.includes("/")) {
    // Format: "6/30/2025 8:00 AM" or "30/Jun 8:00 AM"
    const parts = dateStr.split(" ");
    const datePart = parts[0];

    return dateStr.length <= 14
      ? new Date(correctBookingDate(dateStr))
      : new Date(datePart);
  }
  return new Date(dateStr);
}

// Check if two date ranges overlap
function dateRangesOverlap(start1, end1, start2, end2) {
  return start1 <= end2 && end1 >= start2;
}

export { parseDate, dateRangesOverlap };
