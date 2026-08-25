"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextToken = getNextToken;
const Counter_1 = __importDefault(require("../models/Counter"));
async function getNextToken(timezone = 'Asia/Kolkata') {
    // Get current date in the specified timezone
    const now = new Date();
    const options = { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' };
    const dateFormatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD
    const dateParts = dateFormatter.formatToParts(now);
    const year = dateParts.find((p) => p.type === 'year')?.value;
    const month = dateParts.find((p) => p.type === 'month')?.value;
    const day = dateParts.find((p) => p.type === 'day')?.value;
    const tokenDate = `${year}-${month}-${day}`;
    const counterId = 'daily-order-token';
    // Atomic operation: find the counter, if it matches the current date, increment.
    // If date doesn't match or counter doesn't exist, this might require a different approach or an upsert with conditions.
    // Let's first try to atomically increment where date matches
    let counter = await Counter_1.default.findOneAndUpdate({ _id: counterId, date: tokenDate }, { $inc: { sequence: 1 } }, { new: true });
    if (!counter) {
        // If it doesn't exist for today, we try to update the date and reset sequence to 1.
        // However, what if another request does this concurrently?
        // We use findOneAndUpdate again.
        counter = await Counter_1.default.findOneAndUpdate({ _id: counterId }, { $set: { date: tokenDate, sequence: 1 } }, { new: true, upsert: true });
    }
    // To truly handle concurrency perfectly where day changes, the above might have a race condition on day reset.
    // A safer approach:
    // We can include date in the _id itself: `daily-order-token-${tokenDate}`
    const safeCounterId = `daily-order-token-${tokenDate}`;
    const safeCounter = await Counter_1.default.findOneAndUpdate({ _id: safeCounterId }, { $inc: { sequence: 1 }, $set: { date: tokenDate } }, { new: true, upsert: true });
    return {
        tokenNumber: safeCounter.sequence,
        tokenDate,
    };
}
//# sourceMappingURL=token.js.map