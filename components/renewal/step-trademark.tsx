import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Trademark } from '@/lib/types';

export function StepTrademark({
  trademark,
  onBack,
  onNext,
}: {
  trademark: Trademark;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Confirm trademark</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        <div className="grid gap-1">
          <div className="text-sm font-medium">{trademark.name}</div>
          <div className="text-muted-foreground text-sm">
            {trademark.jurisdiction} • {trademark.registrationNumber}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground text-xs">Current renewal date</div>
            <div className="text-sm font-medium">{trademark.renewalDate ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Classes</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {trademark.classes.map((niceClass) => (
                <Badge key={niceClass} variant="outline">
                  {niceClass}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </CardFooter>
    </Card>
  );
}

