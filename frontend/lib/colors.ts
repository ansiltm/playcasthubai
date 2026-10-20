export const COLOR_PALETTE: Record<string, { bg: string; border?: string }> = {
  'Red': { bg: '#EF4444' },
  'Cherry Red': { bg: '#DC2626' },
  'Metallic Red': { bg: '#E11D48' },
  'Racing Red': { bg: '#F43F5E' },
  'Blue': { bg: '#3B82F6' },
  'Electric Blue': { bg: '#0EA5E9' },
  'Navy Blue': { bg: '#1E3A8A' },
  'Sky Blue': { bg: '#38BDF8' },
  'Police Blue': { bg: '#1D4ED8' },
  'Yellow': { bg: '#EAB308' },
  'Industrial Yellow': { bg: '#FACC15' },
  'Vibrant Yellow': { bg: '#FDE047' },
  'Bright Yellow': { bg: '#FEF08A' },
  'Black': { bg: '#1E293B' },
  'Gloss Black': { bg: '#09090B' },
  'Matte Black': { bg: '#18181B' },
  'Black & White': { bg: 'linear-gradient(135deg, #09090B 50%, #F8FAFC 50%)' },
  'Green': { bg: '#10B981' },
  'Forest Green': { bg: '#059669' },
  'Neon Green': { bg: '#22C55E' },
  'Army Green': { bg: '#4D7C0F' },
  'Military Green': { bg: '#3F6212' },
  'Orange': { bg: '#F97316' },
  'Construction Orange': { bg: '#EA580C' },
  'Pink': { bg: '#EC4899' },
  'Baby Pink': { bg: '#F472B6' },
  'White': { bg: '#F8FAFC', border: '#94A3B8' },
  'Pure White': { bg: '#FFFFFF', border: '#CBD5E1' },
  'Obsidian White': { bg: '#F1F5F9', border: '#CBD5E1' },
  'Silver': { bg: '#94A3B8' },
  'Desert Sand': { bg: '#D4B996' },
  'Multicolor': { bg: 'linear-gradient(135deg, #EF4444 0%, #EAB308 33%, #3B82F6 66%, #10B981 100%)' },
  'Multicolor Set': { bg: 'linear-gradient(135deg, #EF4444 0%, #EAB308 33%, #3B82F6 66%, #10B981 100%)' },
};

export function getColorSwatch(color: string) {
  if (COLOR_PALETTE[color]) return COLOR_PALETTE[color];
  const lower = color.toLowerCase();
  for (const [key, val] of Object.entries(COLOR_PALETTE)) {
    if (lower.includes(key.toLowerCase())) return val;
  }
  return { bg: '#64748B' };
}
