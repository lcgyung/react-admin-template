import { z } from 'zod';

export const userFormSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  role: z.enum(['admin', 'manager', 'user']),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
