
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/financialUtils';

interface IncomeExpenseCardProps {
  totalIncome: number;
  totalExpenses: number;
  percentChange: number;
}

const IncomeExpenseCard = ({ totalIncome, totalExpenses, percentChange }: IncomeExpenseCardProps) => {
  const netIncome = totalIncome - totalExpenses;
  const isPositive = netIncome >= 0;
  const changeIsPositive = percentChange >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <span className={isPositive ? 'text-navido-green-600' : 'text-red-500'}>
            {formatCurrency(Math.abs(netIncome))}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            {isPositive ? 'surplus' : 'deficit'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Total Income: <span className="font-medium text-navido-green-600">{formatCurrency(totalIncome)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Total Expenses: <span className="font-medium text-red-500">{formatCurrency(totalExpenses)}</span>
        </p>
        <div className="flex items-center pt-2 text-sm">
          {changeIsPositive ? (
            <ArrowUp className="mr-1 h-4 w-4 text-navido-green-500" />
          ) : (
            <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
          )}
          <span className={changeIsPositive ? 'text-navido-green-500' : 'text-red-500'}>
            {Math.abs(percentChange)}% from last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseCard;
