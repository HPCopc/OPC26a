// app/admin/page.tsx
import { redirect } from 'next/navigation';

export default function AdminRoot() {
  redirect('/admin/dashboard');   // 👈 auto-redirect to dashboard
}