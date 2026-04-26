'use client';
import dynamic from 'next/dynamic';

const AdminPageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function AdminPage() {
  return <AdminPageClient />;
}
