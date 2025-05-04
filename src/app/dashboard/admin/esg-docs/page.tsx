import ProtectedAdminPage from '@/components/auth/ProtectedAdminPage';
import { AdminEsgDocsPageContent } from './AdminEsgDocsPageContent';

export default function AdminEsgDocsPage() {
  return (
    <ProtectedAdminPage>
      <AdminEsgDocsPageContent />
    </ProtectedAdminPage>
  );
}
