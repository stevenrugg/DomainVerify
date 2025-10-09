import { VerificationHistory } from '../VerificationHistory'

export default function VerificationHistoryExample() {
  const mockRecords = [
    {
      id: '1',
      domain: 'example.com',
      method: 'dns' as const,
      status: 'verified' as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      domain: 'test.org',
      method: 'file' as const,
      status: 'failed' as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      domain: 'mysite.io',
      method: 'dns' as const,
      status: 'pending' as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ]
  
  return (
    <div className="w-full max-w-2xl">
      <VerificationHistory records={mockRecords} />
    </div>
  )
}
