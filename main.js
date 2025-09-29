import { parseDate, dateRangesOverlap } from "./helperFunctions.js";

function checkAvailabilityAndOverbooking(
  startDate,
  endDate,
  carsArr,
  rentalData
) {
  // Parse input dates
  const checkStart = new Date(startDate);
  const checkEnd = new Date(endDate);

  // Initialize results
  const availability = {};
  const overbooking = {};

  // Initialize counters for requested vehicles
  carsArr.forEach((sipp) => {
    availability[sipp] = rentalData.fleet[sipp].count || 0;
    overbooking[sipp] = 0;
  });

  // Check currently rented vehicles
  rentalData.onRent.forEach((rental) => {
    const sipp = rental.vehicle.SIPP;
    if (carsArr.includes(sipp)) {
      const returnDate = parseDate(rental.returnDate);

      // If rental overlaps with our check period, reduce availability
      if (dateRangesOverlap(checkStart, checkEnd, new Date(), returnDate)) {
        availability[sipp] = Math.max(0, availability[sipp] - 1);
      }
    }
  });

  // Check accepted bookings
  rentalData.acceptedBookings.forEach((booking) => {
    const sipp = booking.vehicle.SIPP;
    if (carsArr.includes(sipp)) {
      const pickupDate = parseDate(booking.pickupDateTime);
      const duration = parseInt(booking.rentalDuration.split(" ")[0]);
      const returnDate = new Date(pickupDate);
      returnDate.setDate(returnDate.getDate() + duration);

      // If booking overlaps with our check period, reduce availability
      if (dateRangesOverlap(checkStart, checkEnd, pickupDate, returnDate)) {
        availability[sipp] = Math.max(0, availability[sipp] - 1);

        // Check for overbooking (negative availability)
        if (availability[sipp] < 0) {
          overbooking[sipp] = Math.abs(availability[sipp]);
          availability[sipp] = 0;
        }
      }
    }
  });

  // Calculate total demand vs supply for overbooking analysis
  const demandAnalysis = {};
  carsArr.forEach((sipp) => {
    const totalFleet = rentalData.fleet[sipp]
      ? rentalData.fleet[sipp].count
      : 0;
    let totalDemand = 0;

    // Count current rentals overlapping with check period
    rentalData.onRent.forEach((rental) => {
      if (rental.vehicle.SIPP === sipp) {
        const returnDate = parseDate(rental.returnDate);
        if (dateRangesOverlap(checkStart, checkEnd, new Date(), returnDate)) {
          totalDemand++;
        }
      }
    });

    // Count accepted bookings overlapping with check period
    rentalData.acceptedBookings.forEach((booking) => {
      if (booking.vehicle.SIPP === sipp) {
        const pickupDate = parseDate(booking.pickupDateTime);
        const duration = parseInt(booking.rentalDuration.split(" ")[0]);
        const returnDate = new Date(pickupDate);
        returnDate.setDate(returnDate.getDate() + duration);

        if (dateRangesOverlap(checkStart, checkEnd, pickupDate, returnDate)) {
          totalDemand++;
        }
      }
    });

    demandAnalysis[sipp] = {
      totalFleet,
      totalDemand,
      available: Math.max(0, totalFleet - totalDemand),
      overbooked: Math.max(0, totalDemand - totalFleet),
    };
  });

  return {
    availability,
    overbooking: demandAnalysis,
    period: {
      start: checkStart,
      end: checkEnd,
    },
  };
}

export { checkAvailabilityAndOverbooking };
