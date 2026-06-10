import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createUser, getUser, getUsers } from '../api/usersApi';
import type { CreateUserInput } from '@/entities/user';

export const userKeys = {
  all: ['users'] as const,
  detail: (id: number) => ['users', id] as const,
};

export const useUsers = () =>
  useQuery({
    queryKey: userKeys.all,
    queryFn: getUsers,
  });

export const useUser = (id: number) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: Number.isFinite(id),
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
