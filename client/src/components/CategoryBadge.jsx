const CATEGORY_COLORS = {
  'Groceries':           { bg: 'rgba(76, 175, 80, 0.15)',  text: '#66bb6a',  border: 'rgba(76, 175, 80, 0.3)' },
  'Rent':                { bg: 'rgba(239, 83, 80, 0.15)',  text: '#ef5350',  border: 'rgba(239, 83, 80, 0.3)' },
  'Electricity':         { bg: 'rgba(255, 183, 77, 0.15)', text: '#ffb74d',  border: 'rgba(255, 183, 77, 0.3)' },
  'Petrol':              { bg: 'rgba(66, 165, 245, 0.15)', text: '#42a5f5',  border: 'rgba(66, 165, 245, 0.3)' },
  'Auto / Cab':          { bg: 'rgba(171, 71, 188, 0.15)', text: '#ab47bc',  border: 'rgba(171, 71, 188, 0.3)' },
  'Medicines':           { bg: 'rgba(236, 64, 122, 0.15)', text: '#ec407a',  border: 'rgba(236, 64, 122, 0.3)' },
  'OTT / Entertainment': { bg: 'rgba(255, 112, 67, 0.15)', text: '#ff7043',  border: 'rgba(255, 112, 67, 0.3)' },
  'Mobile Recharge':     { bg: 'rgba(38, 198, 218, 0.15)', text: '#26c6da',  border: 'rgba(38, 198, 218, 0.3)' },
  'Dining / Zomato':     { bg: 'rgba(255, 138, 101, 0.15)',text: '#ff8a65',  border: 'rgba(255, 138, 101, 0.3)' },
  'School / Tuition':    { bg: 'rgba(120, 144, 156, 0.15)',text: '#78909c',  border: 'rgba(120, 144, 156, 0.3)' },
  'Clothing':            { bg: 'rgba(149, 117, 205, 0.15)',text: '#9575cd',  border: 'rgba(149, 117, 205, 0.3)' },
  'EMI / Loan':          { bg: 'rgba(229, 57, 53, 0.15)',  text: '#e53935',  border: 'rgba(229, 57, 53, 0.3)' },
  'Miscellaneous':       { bg: 'rgba(158, 158, 158, 0.15)',text: '#9e9e9e',  border: 'rgba(158, 158, 158, 0.3)' },
};

export default function CategoryBadge({ category }) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS['Miscellaneous'];

  return (
    <span
      className="category-badge"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {category}
    </span>
  );
}
