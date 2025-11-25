import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-start justify-center px-2 py-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center w-[70px]">
              {/* Circle */}
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center transition-all
                  ${
                    isCompleted
                      ? 'bg-blue-500 border-2 border-blue-500'
                      : isCurrent
                      ? 'bg-white border-[3px] border-blue-500'
                      : 'bg-white border-2 border-gray-300'
                  }
                `}
              >
                {isCompleted && <Check className="w-3 h-3 text-white font-bold" />}
              </div>

              {/* Label */}
              <p
                className={`
                  text-[10px] mt-1 text-center leading-tight
                  ${
                    isCompleted || isCurrent
                      ? 'text-gray-700 font-semibold'
                      : 'text-gray-400'
                  }
                `}
              >
                {step.label}
              </p>
            </div>

            {/* Line between circles */}
            {!isLast && (
              <div className="flex-1 h-0.5 bg-gray-300 mt-3 -mx-1">
                <div
                  className={`h-full transition-all ${
                    isCompleted ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
