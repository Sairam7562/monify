
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, ChartBar } from 'lucide-react';

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
        <ChartBar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <span className={isPositive ? 'text-navido-green-600' : 'text-red-500'}>
            ${Math.abs(netIncome).toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Total Income: ${totalIncome.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Total Expenses: ${totalExpenses.toLocaleString()}
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
