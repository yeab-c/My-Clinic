// generates all slots from 09:00 to 16:30 in 30 min intervals
const generateSlots = () => {
  const slots = [];
  let hour = 9;
  let min = 0;

  while (hour < 16 || (hour === 16 && min === 0)) {
    slots.push(
      `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`
    );
    min += 30;
    if (min === 60) {
      min = 0;
      hour++;
    }
  }

  slots.push("16:30");
  return slots;
};

export default generateSlots;