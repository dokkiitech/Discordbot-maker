import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'リポジトリ設定' },
  { number: 2, title: 'APIプロファイル' },
  { number: 3, title: 'コマンド定義' },
  { number: 4, title: '確認・生成' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full p-4 rounded-lg liquid-blur-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors text-white',
                  currentStep > step.number
                    ? 'bg-success'
                    : currentStep === step.number
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <p
                className="mt-2 text-sm font-medium"
                style={{
                  color: currentStep >= step.number ? 'var(--foreground)' : 'var(--muted)'
                }}
              >
                {step.title}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 -mt-8">
                <div
                  className="h-full transition-colors"
                  style={{
                    backgroundColor: currentStep > step.number ? 'var(--success)' : 'var(--border)'
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
