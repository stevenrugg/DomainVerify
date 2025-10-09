import { VerificationStatus } from '../VerificationStatus'

export default function VerificationStatusExample() {
  return (
    <VerificationStatus 
      status="verified"
      domain="example.com"
      onReset={() => console.log('Reset clicked')}
    />
  )
}
