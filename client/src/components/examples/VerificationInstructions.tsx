import { VerificationInstructions } from '../VerificationInstructions'

export default function VerificationInstructionsExample() {
  return (
    <VerificationInstructions 
      method="dns"
      domain="example.com"
      token="verify-domain-abc123def456789"
      onVerify={() => console.log('Verify clicked')}
      isVerifying={false}
    />
  )
}
