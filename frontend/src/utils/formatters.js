export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-SD', {
    style: 'currency',
    currency: 'SDG',
    minimumFractionDigits: 0
  }).format(amount).replace('SDG', 'ج.س');
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const translateDocType = (type, t) => {
  const map = {
    'POWER_OF_ATTORNEY': t ? t('docTypePoa') : 'توكيل',
    'SALE_CONTRACT': t ? t('docTypeSale') : 'عقد بيع',
    'DECLARATION': t ? t('docTypeDec') : 'إقرار',
    'OTHER': t ? t('docTypeOther') : 'أخرى'
  };
  return map[type] || type;
};
