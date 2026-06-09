import {
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { Loading } from '@/components/common/Loading';
import { PageHeader } from '@/components/common/PageHeader';
import { useUsers } from '@/hooks/useUsers';
import type { Role } from '@/types/user';
import { formatDate } from '@/utils/format';

const roleColor: Record<Role, 'error' | 'warning' | 'default'> = {
  admin: 'error',
  manager: 'warning',
  user: 'default',
};

export const UsersPage = () => {
  const { data: users, isLoading, isError } = useUsers();

  return (
    <div>
      <PageHeader title="사용자" description="등록된 사용자 목록" />

      {isLoading && <Loading />}
      {isError && <Alert severity="error">사용자 목록을 불러오지 못했습니다.</Alert>}

      {users && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>역할</TableCell>
                <TableCell>가입일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" color={roleColor[u.role]} />
                  </TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
