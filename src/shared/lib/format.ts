import dayjs from 'dayjs';

export const formatDate = (value: string | number | Date, template = 'YYYY-MM-DD') =>
  dayjs(value).format(template);

export const formatDateTime = (value: string | number | Date) =>
  dayjs(value).format('YYYY-MM-DD HH:mm');
