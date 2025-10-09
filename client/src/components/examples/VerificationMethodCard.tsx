import { VerificationMethodCard } from '../VerificationMethodCard'
import { FileText } from 'lucide-react'

export default function VerificationMethodCardExample() {
  return (
    <div className="w-80">
      <VerificationMethodCard 
        icon={FileText}
        title="DNS TXT Record"
        description="Add a TXT record to your domain's DNS settings"
        onSelect={() => console.log('DNS method selected')}
        selected={false}
      />
    </div>
  )
}
