export async function sendEmail(email: string, users: any[]) {
  return fetch('/api/send-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, users }),
  });
}
