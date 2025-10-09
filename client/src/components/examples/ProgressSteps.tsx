import { ProgressSteps } from '../ProgressSteps'

export default function ProgressStepsExample() {
  const steps = [
    { id: 1, label: 'Input' },
    { id: 2, label: 'Method' },
    { id: 3, label: 'Verify' },
    { id: 4, label: 'Complete' },
  ]
  
  return <ProgressSteps currentStep={2} steps={steps} />
}
