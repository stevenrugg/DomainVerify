import { DomainInput } from '../DomainInput'

export default function DomainInputExample() {
  return (
    <DomainInput 
      onSubmit={(domain) => console.log('Domain submitted:', domain)} 
    />
  )
}
