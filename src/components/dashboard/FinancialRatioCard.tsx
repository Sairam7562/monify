
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

interface FinancialRatioCardProps {
  title: string;
  value: number;
  targetValue: number;
  description: string;
  goodDirection: 'higher' | 'lower';
}

const FinancialRatioCard = ({
  title,
  value,
  targetValue,
  description,
  goodDirection,
}: FinancialRatioCardProps) => {
  // Determine if the current value is good based on the desired direction
  const isPositive =
    (goodDirection === 'higher' && value >= targetValue) ||
    (goodDirection === 'lower' && value <= targetValue);

  // Format the value based on what kind of ratio it is (percentage, decimal, etc.)
  const formattedValue = value.toFixed(2);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <span className={isPositive ? 'text-navido-green-600' : 'text-amber-500'}>
            {formattedValue}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Target: {targetValue.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FinancialRatioCard;
