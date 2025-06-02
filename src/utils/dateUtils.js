import dayjs from 'dayjs';

export const formatDate = (date) => date.toISOString().split("T")[0];

export const getCurrentDate = () => formatDate(new Date());

export const getDateStr = (date) => dayjs(date).format('YYYY-MM-DD');

export const isToday = (date) => dayjs(date).isSame(dayjs(), 'day');

export const sortEntriesByDate = (entries) => 
  [...entries].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()); 