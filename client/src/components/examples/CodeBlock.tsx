import { CodeBlock } from '../CodeBlock'

export default function CodeBlockExample() {
  return (
    <div className="w-full max-w-2xl">
      <CodeBlock 
        code="verify-domain-abc123def456"
        language="text"
      />
    </div>
  )
}
