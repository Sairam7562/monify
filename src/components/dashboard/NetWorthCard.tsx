
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, CircleDollarSign } from 'lucide-react';

interface NetWorthCardProps {
  totalAssets: number;
  totalLiabilities: number;
  percentChange: number;
}

const NetWorthCard = ({ totalAssets, totalLiabilities, percentChange }: NetWorthCardProps) => {
  const netWorth = totalAssets - totalLiabilities;
  const isPositive = netWorth >= 0;
  const changeIsPositive = percentChange >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <span className={isPositive ? 'text-navido-green-600' : 'text-red-500'}>
            ${Math.abs(netWorth).toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Total Assets: ${totalAssets.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Total Liabilities: ${totalLiabilities.toLocaleString()}
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

export default NetWorthCard;
