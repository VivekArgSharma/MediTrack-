interface IllustrationProps {
  tone?: string;
}

const heartAsset = '/heart.svg';
const lungsAsset = '/lungs.svg';

export function HeartIllustration({ tone = '#dc6d57' }: IllustrationProps) {
  return (
    <div className="medical-illustration-frame" style={{ ['--tone' as string]: tone }}>
      <img src={heartAsset} alt="" className="medical-illustration medical-illustration--heart" />
    </div>
  );
}

export function LungsIllustration({ tone = '#7da59a' }: IllustrationProps) {
  return (
    <div className="medical-illustration-frame" style={{ ['--tone' as string]: tone }}>
      <img src={lungsAsset} alt="" className="medical-illustration medical-illustration--lungs" />
    </div>
  );
}

export function BodyMapIllustration({ tone = '#d87e69' }: IllustrationProps) {
  return (
    <svg viewBox="0 0 180 420" className="body-map-svg" aria-hidden="true">
      <circle cx="90" cy="39" r="24" fill="#dcdad2" />
      <path d="M58 76c12 13 20 30 20 51v43c0 24-10 44-10 66v133" fill="none" stroke="#dcdad2" strokeWidth="19" strokeLinecap="round" />
      <path d="M122 76c-12 13-20 30-20 51v43c0 24 10 44 10 66v133" fill="none" stroke="#dcdad2" strokeWidth="19" strokeLinecap="round" />
      <path d="M36 148c18 12 31 28 39 48" fill="none" stroke="#dcdad2" strokeWidth="14" strokeLinecap="round" />
      <path d="M144 148c-18 12-31 28-39 48" fill="none" stroke="#dcdad2" strokeWidth="14" strokeLinecap="round" />
      <path d="M70 370c0-26 9-48 20-62" fill="none" stroke="#dcdad2" strokeWidth="14" strokeLinecap="round" />
      <path d="M110 370c0-26-9-48-20-62" fill="none" stroke="#dcdad2" strokeWidth="14" strokeLinecap="round" />
      <circle className="sensor-dot" cx="90" cy="124" r="7" fill={tone} />
      <circle className="sensor-dot" cx="76" cy="150" r="6" fill={tone} />
      <circle className="sensor-dot" cx="104" cy="150" r="6" fill={tone} />
      <circle className="sensor-dot" cx="90" cy="208" r="5" fill="#274c77" />
    </svg>
  );
}
