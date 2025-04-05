
/**
 * Utility functions for financial calculations
 */

/**
 * Convert a value to a monthly amount based on frequency
 * @param amount The amount to convert
 * @param frequency The frequency (weekly, bi-weekly, monthly, annually)
 * @returns The monthly equivalent amount
 */
export function convertToMonthly(amount: number, frequency: string): number {
  // Convert to monthly values
  if (frequency === 'weekly') return amount * 4.33;
  if (frequency === 'bi-weekly') return amount * 2.17;
  if (frequency === 'annually') return amount / 12;
  return amount; // monthly is default
}

/**
 * Format a number as currency
 * @param value The number to format
 * @param currency The currency symbol (default: $)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = '$'): string {
  return `${currency}${value.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Format a percentage value
 * @param value The value to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Parse a string value to a number, returning 0 if invalid
 * @param value The string value to parse
 * @returns The parsed number or 0 if invalid
 */
export function safeParseFloat(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  
  const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Calculate total from an array of financial items
 * @param items Array of items with amount/value property
 * @param valueKey The key to use for getting the value ('amount' or 'value')
 * @returns The sum of all values
 */
export function calculateTotal(
  items: Array<any> | null | undefined, 
  valueKey: 'amount' | 'value' = 'amount'
): number {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + safeParseFloat(item[valueKey]), 0);
}

/**
 * Calculate monthly total from financial items considering frequency
 * @param items Array of items with amount and frequency properties
 * @returns The monthly equivalent sum
 */
export function calculateMonthlyTotal(items: Array<any> | null | undefined): number {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((sum, item) => {
    const amount = safeParseFloat(item.amount);
    const frequency = item.frequency || 'monthly';
    return sum + convertToMonthly(amount, frequency);
  }, 0);
}

/**
 * Calculate categorical expenses (e.g., housing)
 * @param expenses Array of expense items
 * @param category The category to filter by
 * @returns The monthly equivalent sum for the category
 */
export function calculateCategoryExpenses(
  expenses: Array<any> | null | undefined, 
  category: string
): number {
  if (!expenses || !Array.isArray(expenses)) return 0;
  
  return expenses
    .filter(item => item.category?.toLowerCase() === category.toLowerCase())
    .reduce((sum, item) => {
      const amount = safeParseFloat(item.amount);
      const frequency = item.frequency || 'monthly';
      return sum + convertToMonthly(amount, frequency);
    }, 0);
}
