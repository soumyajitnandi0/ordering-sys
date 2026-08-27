import Counter from '../models/Counter';

export async function getNextToken(timezone: string = 'Asia/Kolkata'): Promise<{ tokenNumber: number; tokenDate: string }> {
  // Get current date in the specified timezone
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' };
  const dateFormatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD
  const dateParts = dateFormatter.formatToParts(now);
  const year = dateParts.find((p) => p.type === 'year')?.value;
  const month = dateParts.find((p) => p.type === 'month')?.value;
  const day = dateParts.find((p) => p.type === 'day')?.value;
  
  const tokenDate = `${year}-${month}-${day}`;
  const safeCounterId = `all-time-order-token`;
  const safeCounter = await Counter.findOneAndUpdate(
    { _id: safeCounterId },
    { $inc: { sequence: 1 }, $set: { date: tokenDate } },
    { new: true, upsert: true }
  );

  return {
    tokenNumber: safeCounter.sequence,
    tokenDate,
  };
}
